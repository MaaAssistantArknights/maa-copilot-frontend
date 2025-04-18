import { clamp } from 'lodash-es'

import i18n from '../i18n'

const ratingLevelKeys = [
  'models.rating.level.overwhelmingly_negative',
  'models.rating.level.very_negative',
  'models.rating.level.negative',
  'models.rating.level.mostly_negative',
  'models.rating.level.mixed',
  'models.rating.level.mostly_positive',
  'models.rating.level.positive',
  'models.rating.level.very_positive',
  'models.rating.level.overwhelmingly_positive',
]

const minRatingLevel = 0
const maxRatingLevel = 10

export function ratingLevelToString(level: number): string {
  const ratio = level / (maxRatingLevel - minRatingLevel)

  const index = clamp(
    Math.floor(ratio * ratingLevelKeys.length),
    0,
    ratingLevelKeys.length - 1,
  )

  return i18n.t(ratingLevelKeys[index])
}
