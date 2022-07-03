import { Card } from "@blueprintjs/core";
import { CardTitle } from "components/CardTitle";
import { Operations } from "components/Operations";
import { AccountManager } from "src/components/AccountManager";
import { GlobalErrorBoundary } from "src/components/GlobalErrorBoundary";
import { OperationEditorLauncher } from './components/editor/OperationEditorLauncher';

function App() {
  return (
    <div className="flex flex-col h-full w-full bg-zinc-50">
      <nav className="flex w-full px-8 py-2 items-center bg-zinc-100 shadow">
        <div className="select-none text-lg font-bold leading-none mr-6">
          MAA Copilot
        </div>

        <div className="flex-1"></div>

        <AccountManager />
      </nav>
      <div className="h-[1px] w-full bg-gray-200"></div>

      <GlobalErrorBoundary>
        <div className="flex flex-col md:flex-row px-8 mt-8 pb-16">
          <div className="md:w-2/3 order-2 md:order-1 mr-0 md:mr-8">
            <Operations />
          </div>
          <div className="md:w-1/3 order-1 md:order-2">
            <Card className="flex flex-col mb-4">
              <CardTitle icon="add">创建新作业</CardTitle>

              <OperationEditorLauncher />
            </Card>
          </div>
        </div>
      </GlobalErrorBoundary>
    </div>
  );
}

export default App;
