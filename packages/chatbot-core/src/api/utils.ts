export type ApiResponse<T = any> = {
  json: T
  status?: number
}

export function createResponse<T>(json: T, status = 200): ApiResponse<T> {
  return { json, status }
}
