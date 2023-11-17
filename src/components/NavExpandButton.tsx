import { Button } from '@blueprintjs/core'

import { useAtomValue, useSetAtom } from 'jotai'

import { navAtom, toggleExpandNavAtom } from 'store/nav'

export const NavExpandButton = () => {
  const expanded = useAtomValue(navAtom)
  const toggleExpaned = useSetAtom(toggleExpandNavAtom)

  return (
    <div className="sm:hidden">
      <Button
        onClick={toggleExpaned}
        icon={expanded.expanded ? 'cross' : 'menu'}
      />
    </div>
  )
}
