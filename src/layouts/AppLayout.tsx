import { Button, IconName, Tag } from '@blueprintjs/core'

import { Link, NavLink } from 'react-router-dom'
import { FCC } from 'types'

import { AccountManager } from 'components/AccountManager'
import { BackToTop } from 'components/BackToTop'

const LINKS: {
  to: string
  label: string
  icon: IconName
}[] = [
  {
    to: '/',
    label: '首页',
    icon: 'home',
  },
  {
    to: '/create',
    label: '创建作业',
    icon: 'add',
  },
]

export const AppLayout: FCC = ({ children }) => (
  <div className="flex flex-col h-full w-full bg-zinc-50">
    <nav className="flex w-full px-8 py-2 items-center bg-zinc-100 shadow fixed h-14 z-10 whitespace-nowrap overflow-x-auto overflow-y-hidden">
      <Link to="/" className="flex items-center hover:no-underline">
        <div className="select-none text-lg font-bold leading-none">
          MAA Copilot
        </div>

        <Tag minimal className="ml-1" intent="warning">
          Beta
        </Tag>
      </Link>

      <div className="w-[1px] bg-gray-200 ml-4 mr-2 my-0.5 flex self-stretch" />

      {LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className="text-sm text-zinc-600 !no-underline ml-2"
        >
          {({ isActive }) => (
            <Button minimal icon={link.icon} active={isActive}>
              {link.label}
            </Button>
          )}
        </NavLink>
      ))}

      <div className="flex-1" />

      <AccountManager />
    </nav>

    <div className="pt-14 pb-16">{children}</div>

    <BackToTop />
  </div>
)
