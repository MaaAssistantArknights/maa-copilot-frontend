import { Response } from 'models/network'
import { Operation, OpRatingType } from 'models/operation'
import { jsonRequest } from 'utils/fetcher'

export const apiPostRating = (id: string, rating: OpRatingType) => {
  return jsonRequest<
    Response<Pick<Operation, 'id' | 'ratingRatio' | 'ratingType'>>
  >('/copilot/rating', {
    method: 'POST',
    json: {
      id,
      rating,
    },
  })
}
