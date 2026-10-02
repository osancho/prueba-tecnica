/** Error body the API and our route handlers answer with. */
export interface ApiError {
  error: string;
  message: string;
}

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

/** The API answered, but not with the shape the app renders. */
export class InvalidApiResponseError extends Error {
  constructor(path: string) {
    super(`Unexpected API response: ${path}`);
    this.name = 'InvalidApiResponseError';
  }
}
