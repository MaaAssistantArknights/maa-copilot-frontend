import { Button, Drawer } from '@blueprintjs/core'

import { useState } from 'react'

import { SheetGroupContainer, SheetGroupProps } from './sheet/SheetGroup'
import {
  SheetOperatorContainer,
  SheetOperatorProps,
} from './sheet/SheetOperator'

type EditorSheetProps = SheetOperatorProps & SheetGroupProps

const EditorOperatorSheet = (sheetProps: EditorSheetProps) => {
  return (
    <div className="overflow-y-auto">
      <SheetOperatorContainer {...sheetProps} />
      <SheetGroupContainer {...sheetProps} />
    </div>
  )
}

export const EditorSheetTrigger = (sheetProps: EditorSheetProps) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Drawer isOpen={open} onClose={() => setOpen(false)}>
        <EditorOperatorSheet {...sheetProps} />
      </Drawer>
      <Button onClick={() => setOpen(true)} text="快捷编辑" />
    </>
  )
}
