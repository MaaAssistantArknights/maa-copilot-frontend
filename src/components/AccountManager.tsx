import {
  Button,
  Dialog, Tab,
  TabId,
  Tabs
} from "@blueprintjs/core";
import { LoginPanel } from "components/account/LoginPanel";
import { FC, useState } from "react";
import { RegisterPanel } from "./account/RegisterPanel";
import {
  GlobalErrorBoundary,
  withGlobalErrorBoundary
} from "./GlobalErrorBoundary";

export const AccountManager: FC = withGlobalErrorBoundary(() => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("login");

  return (
    <>
      <Dialog
        title="MAA Copilot 账户"
        icon="user"
        isOpen={open}
        onClose={() => setOpen(false)}
      >
        <div className="flex flex-col px-4 pt-2">
          <GlobalErrorBoundary>
            <Tabs
              // renderActiveTabPanelOnly: avoid autocomplete on inactive panel
              renderActiveTabPanelOnly={true}
              id="account-manager-tabs"
              onChange={(tab) => {
                setActiveTab(tab);
              }}
              selectedTabId={activeTab}
            >
              <Tab id="login" title="登录" panel={<LoginPanel />} />
              <Tab id="register" title="注册" panel={<RegisterPanel />} />
            </Tabs>
          </GlobalErrorBoundary>
        </div>
      </Dialog>
      <Button className="ml-auto" icon="user" onClick={() => setOpen(true)}>
        登录 / 注册
      </Button>
    </>
  );
});
