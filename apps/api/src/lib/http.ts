export type HttpStatus =
  200 | 201 | 204 | 400 | 401 | 403 | 404 | 409 | 429 | 500;

export interface ApiResponse<T = unknown> {
  status: HttpStatus;
  body: T;
}
