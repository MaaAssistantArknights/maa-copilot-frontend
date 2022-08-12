import { Operation, OpRatingType, Response } from 'models/operation'
import { jsonRequest } from 'utils/fetcher'

export const apiPostRating = (id: string, rating: OpRatingType) => {
  return jsonRequest<
    Response<
      Pick<Operation, 'id' | 'ratingRatio'> & {
        rating: Operation['ratingType']
      }
    >
  >('/copilot/rating', {
    method: 'POST',
    json: {
      id,
      rating,
    },
  })
}
