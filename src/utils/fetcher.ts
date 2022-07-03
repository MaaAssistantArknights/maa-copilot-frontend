import camelcaseKeys from "camelcase-keys";
import unfetch from "unfetch";

const fetch = window.fetch || unfetch;

export class NetworkError extends Error {
  responseMessage: string;

  constructor(response: Response, errorMessage: string) {
    const message = `Request failed for ${response.url}: ${errorMessage} (http status: ${response.status})`;
    super(message);
    this.name = "NetworkError";
    this.responseMessage = errorMessage;
  }
}

export const request = <T,>(input: RequestInfo | URL, init?: RequestInit): Promise<T> =>
  fetch("https://api.prts.plus" + input, init)
    .then(async (res) => {
      return {
        response: res,
        data: camelcaseKeys(await res.json(), { deep: true })
      }
    })
    .then((res) => {
      if ((res.data.statusCode && res.data.statusCode < 200) || res.data.statusCode >= 300) {
        console.error("Fetcher: got error response", res);
        return Promise.reject(new NetworkError(res.response, res.data.message));
      }
      return res.data;
    });

export type JsonRequestInit = RequestInit & {
  json?: any;
}

export const jsonRequest = <T>(input: RequestInfo | URL, init?: JsonRequestInit): Promise<T> => {
  return request<T>(input, {
    ...init,
    headers: {
      ...init?.headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(init?.json),
  });
}
