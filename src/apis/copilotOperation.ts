import { Response } from 'models/network'
import { jsonRequest } from 'utils/fetcher'

import { Operation } from '../models/operation'

export interface OperationUploadResponse {
  id: string
}

export const requestGetOperation = (id: Operation['id']) => {
  return jsonRequest<Response<Operation>>('/copilot/get/' + id)
}

export const requestOperationUpload = (content: string) => {
  return jsonRequest<Response<OperationUploadResponse>>('/copilot/upload', {
    method: 'POST',
    json: {
      content,
    },
  })
}

export const requestOperationUpdate = (
  id: Operation['id'],
  content: string,
) => {
  return jsonRequest<Response<OperationUploadResponse>>('/copilot/update', {
    method: 'POST',
    json: {
      id,
      content,
    },
  })
}

export const requestDeleteOperation = (id: Operation['id']) => {
  return jsonRequest<Response<OperationUploadResponse>>(`/copilot/delete`, {
    method: 'POST',
    json: {
      id,
    },
  })
}
