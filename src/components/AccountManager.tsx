import {
  Alert,
  Button,
  Dialog,
  H4,
  Icon,
  Menu,
  MenuDivider,
  MenuItem,
  Position,
  Tab,
  TabId,
  Tabs,
} from '@blueprintjs/core'
import { Popover2 } from '@blueprintjs/popover2'

import { useAtom } from 'jotai'
import { ComponentType, FC, useState } from 'react'

import { LoginPanel } from 'components/account/LoginPanel'
import { authAtom } from 'store/auth'
import { useCurrentSize } from 'utils/useCurrenSize'

import {
  GlobalErrorBoundary,
  withGlobalErrorBoundary,
} from './GlobalErrorBoundary'
import { AppToaster } from './Toaster'
import { EditDialog } from './account/EditDialog'
import { RegisterPanel } from './account/RegisterPanel'

const AccountMenu: FC = () => {
  const [authState, setAuthState] = useAtom(authAtom)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const { isSM } = useCurrentSize()

  const handleLogout = () => {
    setAuthState({})
    AppToaster.show({
      intent: 'success',
      message: '已退出登录',
    })
  }

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

      <EditDialog
        isOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
      />

      <Menu>
        {!authState.activated && (
          <MenuItem
            disabled
            icon="warning-sign"
            text="账号未激活，请在退出登录后，以重置密码的方式激活"
          />
        )}

        {isSM && (
          <MenuItem
            shouldDismissPopover={false}
            icon="user"
            text={authState.username}
          />
        )}

        <MenuItem
          shouldDismissPopover={false}
          icon="edit"
          text="修改信息..."
          onClick={() => setEditDialogOpen(true)}
        />
        <MenuDivider />

        <MenuItem
          shouldDismissPopover={false}
          intent="danger"
          icon="log-out"
          text="退出登录"
          onClick={() => setLogoutDialogOpen(true)}
        />
      </Menu>
    </>
  )
}

export const AccountAuthDialog: ComponentType<{
  open?: boolean
  onClose?: () => void
}> = withGlobalErrorBoundary(({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('login')

  return (
    <Dialog
      title="MAA Copilot 账户"
      icon="user"
      isOpen={open}
      onClose={onClose}
    >
      <div className="flex flex-col p-4 pt-2">
        <GlobalErrorBoundary>
          <Tabs
            // renderActiveTabPanelOnly: avoid autocomplete on inactive panel
            renderActiveTabPanelOnly={true}
            id="account-auto-tabs"
            onChange={(tab) => {
              setActiveTab(tab)
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
                  onNavigateRegisterPanel={() => setActiveTab('register')}
                  onComplete={() => onClose?.()}
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
              panel={<RegisterPanel onComplete={() => setActiveTab('login')} />}
            />
          </Tabs>
        </GlobalErrorBoundary>
      </div>
    </Dialog>
  )
})

export const AccountManager: ComponentType = withGlobalErrorBoundary(() => {
  const [open, setOpen] = useState(false)
  const [authState] = useAtom(authAtom)
  const { isSM } = useCurrentSize()

  return (
    <>
      <AccountAuthDialog open={open} onClose={() => setOpen(false)} />
      {authState.token ? (
        // BUTTOM_RIGHT设置防止弹出框撑大body超过100vw
        <Popover2 content={<AccountMenu />} position={Position.BOTTOM_RIGHT}>
          <Button
            icon="user"
            text={!isSM && authState.username}
            rightIcon="caret-down"
          />
        </Popover2>
      ) : (
        <Button className="ml-auto" icon="user" onClick={() => setOpen(true)}>
          {!isSM && '登录 / 注册'}
        </Button>
      )}
    </>
  )
})
