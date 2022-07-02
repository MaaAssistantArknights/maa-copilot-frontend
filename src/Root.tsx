import camelcaseKeys from "camelcase-keys";
import { SWRConfig } from "swr";
import unfetch from "unfetch";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
import { FCC } from "./types";

const fetch = window.fetch || unfetch;

export const Root: FCC = ({ children }) => {
  return (
    <SWRConfig
      value={{
        fetcher: (url) =>
          fetch("https://api.prts.plus/copilot" + url)
            .then(async (res) => {
              return camelcaseKeys(await res.json(), { deep: true });
            })
            .then((res) => {
              if (
                (res.statusCode && res.statusCode < 200) ||
                res.statusCode >= 300
              ) {
                console.error("SWR: got error response", res);
                return Promise.reject(new Error(res.message));
              }
              return res;
            }),
        suspense: true,
        focusThrottleInterval: 1000 * 60,
        errorRetryInterval: 1000 * 3,
        errorRetryCount: 3
      }}
    >
      <GlobalErrorBoundary>{children}</GlobalErrorBoundary>
    </SWRConfig>
  );
};
