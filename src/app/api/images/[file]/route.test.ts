// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { normalizeProductImage } from '@/lib/images/normalizeProductImage';
import { GET } from './route';

vi.mock('@/lib/images/normalizeProductImage', () => ({
  normalizeProductImage: vi.fn(),
}));

const fetchMock = vi.fn();
const normalizeMock = vi.mocked(normalizeProductImage);

function requestImage(file: string) {
  return GET(new Request(`http://localhost/api/images/${file}`), {
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
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/webp');
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(
      new Uint8Array([9, 9]),
    );
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
