export interface Version {
  level: string
  version: {
    chineseSimplified: string
    chineseTraditional: string
    english: string
    japanese: string
    korean: string
  }
  status: {
    chineseSimplified: string
    chineseTraditional: string
    english: string
    japanese: string
    korean: string
  }
}

export interface Operator {
  name: string
  id: string
  profession: string
  star: number
}
