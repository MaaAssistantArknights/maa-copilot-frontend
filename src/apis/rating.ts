import { Response } from 'models/network'
import { OpRatingType, Operation } from 'models/operation'
import { jsonRequest } from 'utils/fetcher'

const ratingTypeMapping: Record<OpRatingType, string> = {
  0: 'None',
  1: 'Like',
  2: 'Dislike',
}

export const apiPostRating = (id: Operation['id'], rating: OpRatingType) => {
  return jsonRequest<Response<string>>('/copilot/rating', {
    method: 'POST',
    json: {
      id,
      rating: ratingTypeMapping[rating],
    },
  })
}
