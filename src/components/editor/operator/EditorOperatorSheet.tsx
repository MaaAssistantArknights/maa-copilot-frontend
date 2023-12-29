import { Button, ButtonProps, Drawer, Icon } from '@blueprintjs/core'

import { useAtomValue } from 'jotai'
import { useState } from 'react'

import { favGroupAtom } from '../../../store/useFavGroups'
import { SheetOperatorContainer } from './sheet/SheetOperator'

interface EditorOperatorSheetProps {}

export const EditorOperatorSheet = () => {
  const { groups: favGroups } = useAtomValue(favGroupAtom)

  return (
    <div className="overflow-y-auto">
      <SheetOperatorContainer />
      <div className="h-screen">2fadkshfkajj22</div>
    </div>
  )
}

export const EditorOperatorSheetTrigger = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Drawer isOpen={open} onClose={() => setOpen(false)}>
        {open && <EditorOperatorSheet />}
      </Drawer>
      <Button onClick={() => setOpen(true)}>快捷编辑</Button>
    </>
  )
}

interface ItemProps extends ButtonProps {
  title: string
}

const ButtonItem = ({ title, icon, ...buttonProps }: ItemProps) => (
  <Button {...buttonProps} className="text-center">
    <Icon icon={icon} />
    <p>{title}</p>
  </Button>
)
