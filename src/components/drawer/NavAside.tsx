import { Button, Portal } from '@blueprintjs/core'

import { useAtomValue, useSetAtom } from 'jotai'
import { LINKS } from 'layouts/AppLayout'
import { NavLink } from 'react-router-dom'

import { navAtom, toggleExpandNavAtom } from 'store/nav'

export const NavAside = () => {
  const nav = useAtomValue(navAtom)
  const toggleNav = useSetAtom(toggleExpandNavAtom)
  const navLinks = [...LINKS]

  if (!nav.expanded) return null

  return (
    <Portal>
      {/* todo: 这里可以重写移动端header 需要去掉top */}
      <div className="fixed inset-0 top-14 z-50 overflow-y-auto backdrop-blur-lg sm:hidden">
        <div className="px-4 sm:px-6 pt-3 pb-6">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <div className="flex-col w-full" key={link.to}>
                <NavLink
                  to={link.to}
                  className="text-sm text-zinc-600 !no-underline"
                  onClick={() => toggleNav()}
                >
                  {({ isActive }) => (
                    <Button
                      minimal
                      icon={link.icon}
                      active={isActive}
                      className="w-full flex items-center"
                      style={{ justifyContent: 'flex-start' }}
                    >
                      {link.label}
                    </Button>
                  )}
                </NavLink>
              </div>
            ))}
          </nav>
        </div>
      </div>
    </Portal>
  )
}
