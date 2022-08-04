import { Response } from 'models/operation'
import { jsonRequest } from 'utils/fetcher'

export interface CopilotUploadResponse {
  id: string
}

export const requestCopilotUpload = (
  content: string,
) => {
  return jsonRequest<Response<CopilotUploadResponse>>('/copilot/upload', {
    method: 'POST',
    json: {
      content
    },
  })
}
