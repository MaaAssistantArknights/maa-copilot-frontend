export interface Response<T> {
  statusCode: number
  message: string
  traceId: string
  data: T
}
