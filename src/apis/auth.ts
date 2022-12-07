import { Response } from 'models/network'
import { jsonRequest } from 'utils/fetcher'

export interface LoginResponse {
  token: string
  validBefore: string
  userInfo: UserInfo
}

export interface UserInfo {
  id: string
  userName: string
  role: string
  activated: boolean
  favoriteLists: Record<string, any>
  uploadCount: number
}

export const requestLogin = (email: string, password: string) => {
  return jsonRequest<Response<LoginResponse>>('/user/login', {
    method: 'POST',
    json: {
      email,
      password,
    },
  })
}

export interface ActivationResponse {}

export const requestActivation = (code: string) => {
  return jsonRequest<Response<ActivationResponse>>('/user/activate', {
    method: 'POST',
    json: {
      token: code,
    },
  })
}

export interface ActivationCodeResponse {}

export const requestActivationCode = () => {
  return jsonRequest<Response<ActivationCodeResponse>>(
    '/user/activate/request',
    {
      method: 'POST',
      json: {},
    },
  )
}

export interface RegisterResponse {}

export const requestRegister = (
  email: string,
  username: string,
  password: string,
) => {
  return jsonRequest<Response<RegisterResponse>>('/user/register', {
    method: 'POST',
    json: {
      email,
      user_name: username,
      password,
    },
  })
}

export interface UpdateInfoResponse {}

export const requestUpdateInfo = ({
  email,
  username,
}: {
  email?: string
  username?: string
}) => {
  return jsonRequest<Response<UpdateInfoResponse>>('/user/update/info', {
    method: 'POST',
    json: {
      email,
      user_name: username,
    },
  })
}

export interface UpdatePasswordResponse {}

export const requestUpdatePassword = ({
  original,
  newPassword,
}: {
  original?: string
  newPassword?: string
}) => {
  return jsonRequest<Response<UpdatePasswordResponse>>(
    '/user/update/password',
    {
      method: 'POST',
      json: {
        original_password: original,
        new_password: newPassword,
      },
    },
  )
}

export interface ResetPasswordTokenResponse {}

export const requestResetPasswordToken = (data: { email: string }) => {
  return jsonRequest<Response<ResetPasswordTokenResponse>>(
    '/user/password/reset_request',
    {
      method: 'POST',
      json: data,
    },
  )
}

export interface ResetPasswordResponse {}

export const requestResetPassword = (data: {
  token: string
  password: string
}) => {
  return jsonRequest<Response<ResetPasswordResponse>>('/user/password/reset', {
    method: 'POST',
    json: data,
  })
}
