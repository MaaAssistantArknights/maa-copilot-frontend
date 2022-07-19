import { Tag } from '@blueprintjs/core'
import { AccountManager } from 'components/AccountManager'
import { Link } from 'react-router-dom'
import { FCC } from 'types'

export const AppLayout: FCC = ({ children }) => (
  <div className="flex flex-col h-full w-full bg-zinc-50">
    <nav className="flex w-full px-8 py-2 items-center bg-zinc-100 shadow">
      <Link to="/" className="flex items-center hover:no-underline">
        <div className="select-none text-lg font-bold leading-none">
          MAA Copilot
        </div>

        <Tag minimal className="ml-1" intent="warning">
          Beta
        </Tag>
      </Link>

      <div className="flex-1"></div>

      <AccountManager />
    </nav>
    <div className="h-[1px] w-full bg-gray-200"></div>

    {children}
  </div>
)
