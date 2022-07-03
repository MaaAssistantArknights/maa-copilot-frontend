import { jsonRequest } from '../utils/fetcher';

export const requestLogin = (email: string, password: string) => {
  return jsonRequest("/user/login", {
    method: "POST",
    json: {
      email,
      password,
    },
  });
}
