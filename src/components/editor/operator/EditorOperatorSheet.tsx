import { Button, Drawer } from '@blueprintjs/core'

import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'

import { CopilotDocV1 } from 'models/copilot.schema'

import { favGroupAtom } from '../../../store/useFavGroups'
import { EditorPerformerGroupProps } from './EditorPerformerGroup'
import {
  SheetOperatorContainer,
  SheetOperatorProps,
} from './sheet/SheetOperator'

type Groups = CopilotDocV1.Group[]

type EditorOperatorSheet = SheetOperatorProps & {
  submitGroup: EditorPerformerGroupProps['submit']
  existedGroups: Groups
}

const EditorOperatorSheet = (sheetOperatorProps: EditorOperatorSheet) => {
  // const { groups: favGroups } = useAtomValue(favGroupAtom)
  const sheetOperatorContainer = useMemo(
    () => <SheetOperatorContainer {...sheetOperatorProps} />,
    [sheetOperatorProps.existedOperators],
  )
  return (
    <div className="overflow-y-auto">
      {sheetOperatorContainer}
      <div className="h-screen">2fadkshfkajj22</div>
    </div>
  )
}

export const EditorOperatorSheetTrigger = (sheetProps: EditorOperatorSheet) => {
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
