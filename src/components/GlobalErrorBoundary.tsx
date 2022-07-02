import { Button, NonIdealState } from "@blueprintjs/core";
import { ErrorBoundary } from "@sentry/react";
import { FCC } from '../types';
export const GlobalErrorBoundary: FCC = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={
        <NonIdealState
          icon="issue"
          title="发生了致命错误"
          description="页面渲染出现了致命错误；请尝试"
          action={
            <Button
              intent="primary"
              icon="refresh"
              onClick={() => window.location.reload()}
            >
              刷新页面
            </Button>
          }
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}
