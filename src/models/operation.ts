export interface Response<T> {
  statusCode: number
  message: string
  traceId: string
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
  content: string
  stageName: string
  minimumRequired: string
  uploadTime: string
  title: string
  detail: string
  uploader: string
  operators: string[]
  groups: OperationGroup[]
  views: number
  ratingRatio: number
  ratingType: OpRating
}

export enum OpRating {
  Like = 'Like',
  Dislike = 'Dislike',
  None = 'None',
}

export type OperationListItem = Omit<Operation, 'content'>

export interface OperationGroup {
  name: string
  operators: string[]
}

export enum MinimumRequired {
  V4_0 = 'v4.0',
}
