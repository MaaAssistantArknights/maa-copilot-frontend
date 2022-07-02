import { Button, Card } from "@blueprintjs/core";
import { CardTitle } from "components/CardTitle";
import { Operations } from "components/Operations";
import { GlobalErrorBoundary } from "src/components/GlobalErrorBoundary";

function App() {
  return (
    <div className="flex flex-col h-full w-full bg-zinc-50">
      <nav className="flex w-full px-8 py-2 items-center bg-zinc-100 shadow">
        <div className="select-none text-lg font-bold leading-none mr-6">
          MAA Copilot
        </div>

        <div className="flex-1"></div>

        <Button className="ml-auto" icon="user">
          登录 / 注册
        </Button>
      </nav>
      <div className="h-[1px] w-full bg-gray-200"></div>

      <GlobalErrorBoundary>
        <div className="flex px-8 mt-8">
          <div className="w-2/3 mr-8">
            <Operations />
          </div>
          <div className="w-1/3">
            <Card className="flex flex-col mb-4">
              <CardTitle icon="add">创建新作业</CardTitle>

              <Button large fill icon="open-application">
                启动作业编辑器
              </Button>
            </Card>
          </div>
        </div>
      </GlobalErrorBoundary>
    </div>
  );
}

export default App;
