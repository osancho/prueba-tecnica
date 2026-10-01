import type { ApiError } from '@/types/product';

export class NotFoundError extends Error {
  constructor(path: string) {
    super(`Resource not found: ${path}`);
    this.name = 'NotFoundError';
  }
}

export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiError,
  ) {
    super(body.message);
    this.name = 'ApiRequestError';
  }
}
