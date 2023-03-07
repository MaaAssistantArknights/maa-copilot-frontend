export interface PaginatedResponse<T> {
  hasNext: boolean
  page: number
  total: number
  data: T[]
}

export interface Operation {
  id: string | number
  content: string
  uploadTime: string
  uploader: string
  views: number
  hotScore: number
  available: boolean
  ratingLevel: number // integer in [0, 10]
  ratingRatio: number
  ratingType: OpRatingType
  notEnoughRating: boolean
  difficulty: OpDifficulty
}

export interface Level {
  catOne: string
  catTwo: string
  catThree: string
  name: string
  levelId: string
  stageId: string
  width: number
  height: number
}

export enum OpRatingType {
  None = 0,
  Like = 1,
  Dislike = 2,
}

export enum OpDifficulty {
  UNKNOWN = 0,
  REGULAR = 1,
  HARD = 2,
  REGULAR_HARD = 1 | 2,
}

export enum OpDifficultyBitFlag {
  REGULAR = 1,
  HARD = 2,
}

// exists for historical reasons
export type OperationListItem = Operation

export interface OperationGroup {
  name: string
  operators: string[]
}

export enum MinimumRequired {
  V4_0_0 = 'v4.0.0',
}
