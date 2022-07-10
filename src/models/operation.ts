export interface Response<T> {
  statusCode: number
  message: string
  traceID: string
  data: T
}

export interface PaginatedResponse<T> {
  hasNext: boolean
  page: number
  total: number
  data: T[]
}

export interface Operation {
  id: string
  stageName: string
  minimumRequired: MinimumRequired
  uploadTime: string
  title: string
  detail: string
  uploader: string
  operators: string[]
  groups: OperationGroup[]
  views: number
  ratingRatio: number
  // ratingType: null;
}

export interface OperationGroup {
  name: string
  operators: string[]
}

export enum MinimumRequired {
  V4_0 = 'v4.0',
}
