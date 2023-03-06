import { Response } from 'models/network'
import { OpRatingType, Operation } from 'models/operation'
import { jsonRequest } from 'utils/fetcher'

export const apiPostRating = (id: Operation['id'], rating: OpRatingType) => {
  return jsonRequest<Response<string>>('/copilot/rating', {
    method: 'POST',
    json: {
      id,
      rating,
    },
  })
}
