import { clamp } from 'lodash-es'

const ratingLevels = [
  '差评如潮',
  '特别差评',
  '差评',
  '多半差评',
  '褒贬不一',
  '多半好评',
  '好评',
  '特别好评',
  '好评如潮',
]

const minRatingLevel = 0
const maxRatingLevel = 10

export function ratingLevelToString(level: number): string {
  const ratio = level / (maxRatingLevel - minRatingLevel)

  const index = clamp(
    Math.floor(ratio * ratingLevels.length),
    0,
    ratingLevels.length - 1,
  )

  return ratingLevels[index]
}
