import { jsonRequest } from 'utils/fetcher';
import { Response } from 'models/operation';

export interface LoginResponse {
  token: string;
  validBefore: string;
  userInfo: UserInfo;
}

export interface UserInfo {
  id: string;
  userName: string;
  role: string;
  activated: boolean;
  favoriteLists: Record<string, any>;
  uploadCount: number;
}

export interface RegisterResponse {}

export const requestLogin = (email: string, password: string) => {
  return jsonRequest<Response<LoginResponse>>("/user/login", {
    method: "POST",
    json: {
      email,
      password,
    },
  });
}

export const requestRegister = (email: string, username: string, password: string) => {
  return jsonRequest<Response<RegisterResponse>>("/user/register", {
    method: "POST",
    json: {
      email,
      user_name: username,
      password,
    },
  });
}
