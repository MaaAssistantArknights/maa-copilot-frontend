import {
  Alert,
  Button,
  Dialog,
  H4,
  Icon,
  Menu, MenuItem,
  Position,
  Tab,
  TabId,
  Tabs
} from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";
import { LoginPanel } from "components/account/LoginPanel";
import { useAtom } from "jotai";
import { FC, useState } from "react";
import { authAtom } from "../store/auth";
import { RegisterPanel } from "./account/RegisterPanel";
import {
  GlobalErrorBoundary,
  withGlobalErrorBoundary
} from "./GlobalErrorBoundary";
import { AppToaster } from "./Toaster";

const AccountMenu: FC = () => {
  const [authState, setAuthState] = useAtom(authAtom);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleLogout = () => {
    setAuthState({});
    AppToaster.show({
      intent: "success",
      message: "已退出登录",
    });
  };

  return (
    <>
      <Alert
        isOpen={logoutDialogOpen}
        cancelButtonText="取消"
        confirmButtonText="退出登录"
        icon="log-out"
        intent="danger"
        canOutsideClickCancel
        onCancel={() => setLogoutDialogOpen(false)}
        onConfirm={handleLogout}
      >
        <H4>退出登录</H4>
        <p>确定要退出登录吗？</p>
      </Alert>

      <Menu>
        {/* <MenuItem icon="edit" text="修改用户名" />
        <MenuItem icon="key" text="修改密码" />
        <MenuDivider /> */}
        <MenuItem
          shouldDismissPopover={false}
          intent="danger"
          icon="log-out"
          text="退出登录..."
          onClick={() => setLogoutDialogOpen(true)}
        />
      </Menu>
    </>
  );
};

export const AccountManager: FC = withGlobalErrorBoundary(() => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("login");
  const [authState] = useAtom(authAtom);

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
              <Tab
                id="login"
                title={
                  <div>
                    <Icon icon="person" />
                    <span className="ml-1">登录</span>
                  </div>
                }
                panel={
                  <LoginPanel
                    onNavigateRegisterPanel={() => setActiveTab("register")}
                    onComplete={() => setOpen(false)}
                  />
                }
              />
              <Tab
                id="register"
                title={
                  <div>
                    <Icon icon="new-person" />
                    <span className="ml-1">注册</span>
                  </div>
                }
                panel={
                  <RegisterPanel onComplete={() => setActiveTab("login")} />
                }
              />
            </Tabs>
          </GlobalErrorBoundary>
        </div>
      </Dialog>
      {authState.token ? (
        <Popover2 content={<AccountMenu />} position={Position.BOTTOM}>
          <Button
            icon="user"
            text={authState.username}
            rightIcon="caret-down"
          />
        </Popover2>
      ) : (
        <Button className="ml-auto" icon="user" onClick={() => setOpen(true)}>
          登录 / 注册
        </Button>
      )}
    </>
  );
});
