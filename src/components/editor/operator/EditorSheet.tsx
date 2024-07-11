import { Button, Drawer, DrawerSize } from '@blueprintjs/core'

import { FC, useState } from 'react'

import { CopilotDocV1 } from 'models/copilot.schema'

import { SheetGroupContainer } from './sheet/SheetGroup'
import {
  SheetOperatorContainer,
  SheetOperatorProps,
} from './sheet/SheetOperator'
import {
  SheetContextValue,
  SheetProvider,
  SheetProviderProp,
} from './sheet/SheetProvider'

type EditorSheetProps = SheetContextValue
export type Group = CopilotDocV1.Group
export type Operator = CopilotDocV1.Operator

const EditorOperatorSheet = (sheetProps: EditorSheetProps) => (
  <SheetProvider {...sheetProps}>
    <article className="overflow-y-auto">
      <SheetOperatorContainer />
      <SheetGroupContainer />
    </article>
  </SheetProvider>
)

export const EditorSheetTrigger: FC<EditorSheetProps> = (sheetProps) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Drawer
        isOpen={open}
        onClose={() => setOpen(false)}
        size={DrawerSize.LARGE}
        className="max-w-[900px]"
      >
        <EditorOperatorSheet {...sheetProps} />
      </Drawer>
      <Button onClick={() => setOpen(true)} text="快捷编辑" fill />
    </>
  )
}
