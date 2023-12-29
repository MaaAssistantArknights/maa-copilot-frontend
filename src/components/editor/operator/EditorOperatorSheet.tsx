import { Button, ButtonProps, Drawer, H1, Icon } from '@blueprintjs/core'

import { useAtomValue } from 'jotai'
import { useRef, useState } from 'react'

import { favGroupAtom } from '../../../store/useFavGroups'
import { SheetOperatorContainer } from './sheet/SheetOperator'

interface EditorOperatorSheetProps {}

export const EditorOperatorSheet = () => {
  const { groups: favGroups } = useAtomValue(favGroupAtom)
  const sheetContainer = useRef<HTMLDivElement>(null)
  const backToTop = () =>
    sheetContainer.current?.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <div className="overflow-y-auto" ref={sheetContainer}>
      <SheetOperatorContainer backToTop={backToTop} />
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
