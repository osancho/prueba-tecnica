// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { normalizeProductImage } from '@/services/images/normalize-product-image';
import { GET } from '../route';

vi.mock('@/services/images/normalize-product-image', () => ({
  normalizeProductImage: vi.fn(),
}));

const fetchMock = vi.fn();
const normalizeMock = vi.mocked(normalizeProductImage);

function requestImage(file: string, query = '?v=3&w=648') {
  return GET(new Request(`http://localhost/api/images/${file}${query}`), {
    params: Promise.resolve({ file }),
  });
}

describe('GET /api/images/[file]', () => {
  beforeEach(() => {
    vi.stubEnv('API_BASE_URL', 'https://api.test');
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('serves the normalized picture of a phone from the API image host', async () => {
    fetchMock.mockResolvedValue(new Response(new Uint8Array([1, 2, 3])));
    normalizeMock.mockResolvedValue(Buffer.from([9, 9]));

    const response = await requestImage('SMG-S24U-titanium-violet.webp');

    expect(String(fetchMock.mock.calls[0][0])).toBe(
      'https://api.test/images/SMG-S24U-titanium-violet.webp',
    );
    expect(normalizeMock).toHaveBeenCalledWith(expect.any(Buffer), 648);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/webp');
    expect(response.headers.get('Cache-Control')).toBe(
      'public, max-age=31536000, immutable',
    );
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(
      new Uint8Array([9, 9]),
    );
  });

  it('serves a picture it already prepared without fetching or processing it again', async () => {
    fetchMock.mockImplementation(
      async () => new Response(new Uint8Array([1, 2, 3])),
    );
    normalizeMock.mockResolvedValue(Buffer.from([7, 7]));

    await requestImage('GPX-8A-obsidiana.webp');
    const again = await requestImage('GPX-8A-obsidiana.webp');

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(normalizeMock).toHaveBeenCalledOnce();
    expect(new Uint8Array(await again.arrayBuffer())).toEqual(
      new Uint8Array([7, 7]),
    );
  });

  it('prepares a picture once however many requests ask for it at the same time', async () => {
    let answerOriginal = () => {};
    fetchMock.mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          answerOriginal = () => resolve(new Response(new Uint8Array([1])));
        }),
    );
    normalizeMock.mockResolvedValue(Buffer.from([4, 4]));

    const requests = Array.from({ length: 20 }, () =>
      requestImage('APL-IP15-negro.webp'),
    );
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
    answerOriginal();
    const responses = await Promise.all(requests);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(normalizeMock).toHaveBeenCalledOnce();
    expect(responses.map((response) => response.status)).toEqual(
      Array(20).fill(200),
    );
  });

  it('fails every request waiting on a picture together, then tries again for the next one', async () => {
    let failOriginal = () => {};
    fetchMock
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            failOriginal = () => resolve(new Response(null, { status: 500 }));
          }),
      )
      .mockResolvedValueOnce(new Response(new Uint8Array([1])));
    normalizeMock.mockResolvedValue(Buffer.from([4]));

    const waiting = [
      requestImage('APL-IP15-rosa.webp'),
      requestImage('APL-IP15-rosa.webp'),
    ];
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
    failOriginal();

    expect(
      (await Promise.all(waiting)).map((response) => response.status),
    ).toEqual([502, 502]);
    expect((await requestImage('APL-IP15-rosa.webp')).status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('prepares each width once, so every slot gets its own size', async () => {
    fetchMock.mockImplementation(
      async () => new Response(new Uint8Array([1, 2, 3])),
    );
    normalizeMock.mockResolvedValue(Buffer.from([7, 7]));

    await requestImage('GPX-8A-obsidiana.webp', '?v=3&w=360');
    await requestImage('GPX-8A-obsidiana.webp', '?v=3&w=1260');
    await requestImage('GPX-8A-obsidiana.webp', '?v=3&w=360');

    expect(normalizeMock.mock.calls.map(([, width]) => width)).toEqual([
      360, 1260,
    ]);
  });

  it('keeps serving pictures to URLs without a width, saved by an older version', async () => {
    fetchMock.mockResolvedValue(new Response(new Uint8Array([1])));
    normalizeMock.mockResolvedValue(Buffer.from([5]));

    const response = await requestImage('XMI-14-negro.webp', '?v=2');

    expect(response.status).toBe(200);
    expect(normalizeMock).toHaveBeenCalledWith(expect.any(Buffer), 1260);
  });

  it.each(['?w=100', '?w=abc', '?w=0648', '?w='])(
    'rejects the width in %s without contacting any server',
    async (query) => {
      const response = await requestImage('XMI-14-negro.webp', query);

      expect(response.status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it('asks the API again for a picture it could not get', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 500 }))
      .mockResolvedValueOnce(new Response(new Uint8Array([1])));
    normalizeMock.mockResolvedValue(Buffer.from([5]));

    expect((await requestImage('XMI-14-black.webp')).status).toBe(502);
    expect((await requestImage('XMI-14-black.webp')).status).toBe(200);
  });

  it.each(['../.env.local', 'logo.svg', 'photo.webp?x=1'])(
    'rejects %s without contacting any server',
    async (file) => {
      const response = await requestImage(file);

      expect(response.status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it('answers 404 when the API has no such picture', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    expect((await requestImage('missing.webp')).status).toBe(404);
  });

  it('answers 502 when the image host fails', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    expect((await requestImage('SMG-A25-negro.webp')).status).toBe(502);
  });

  it('answers 502 instead of breaking the page when the image host is down', async () => {
    fetchMock.mockRejectedValue(new Error('timeout'));

    expect((await requestImage('SMG-A25-negro.webp')).status).toBe(502);
  });
});
