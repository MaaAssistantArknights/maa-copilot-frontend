import { Operation, Response } from 'models/operation'
import { jsonRequest } from 'utils/fetcher'
import { OpRating } from '../models/operation'

export const apiPostRating = (id: string, rating: OpRating) => {
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
