import { Button, NonIdealState, Spinner } from "@blueprintjs/core";
import { ErrorBoundary } from "@sentry/react";
import { Suspense } from "react";
import { FCC } from "../types";

export const Suspensable: FCC<{
  fetcher?: () => void;
}> = ({ children, fetcher }) => {
  return (
    <ErrorBoundary
      fallback={
        <NonIdealState
          icon="issue"
          title="加载失败"
          description={fetcher && "数据加载失败，请尝试重试"}
          action={
            fetcher && (
              <Button intent="primary" icon="refresh" onClick={fetcher}>
                重试
              </Button>
            )
          }
        />
      }
    >
      <Suspense fallback={<NonIdealState icon={<Spinner />} title="加载中" />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

export const withSuspensable = (Component: FCC<{
  fetcher?: () => void;
}>) => (props: any) => (
  <Suspensable fetcher={props.fetcher}>
    <Component {...props} />
  </Suspensable>
);

