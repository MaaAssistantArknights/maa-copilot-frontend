export interface PaginatedResponse<T> {
  hasNext: boolean
  page: number
  total: number
  data: T[]
}

export interface Operation {
  id: string
  content: string
  minimumRequired: string
  uploadTime: string
  title: string
  detail: string
  uploader: string
  views: number
  hotScore: number
  level?: Level
  available: boolean
  ratingLevel: OpRatingLevel
  ratingRatio: number
  ratingType: OpRatingType
  isNotEnoughRating: boolean
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

export enum OpRatingLevel {
  OverwhelminglyPositive = 'OverwhelminglyPositive',
  VeryPositive = 'VeryPositive',
  Positive = 'Positive',
  MostlyPositive = 'MostlyPositive',
  Mixed = 'Mixed',
  MostlyNegative = 'MostlyNegative',
  Negative = 'Negative',
  VeryNegative = 'VeryNegative',
  OverwhelminglyNegative = 'OverwhelminglyNegative',
}

export enum OpRatingType {
  Like = 'Like',
  Dislike = 'Dislike',
  None = 'None',
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
