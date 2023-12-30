import { Button, Drawer } from '@blueprintjs/core'

import { useAtomValue } from 'jotai'
import { useState } from 'react'

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
  const { groups: favGroups } = useAtomValue(favGroupAtom)
  // const sheetContainer = useRef<HTMLFormElement>(null)
  // const backToTop = () =>
  //   sheetContainer.current?.scrollTo({ top: 0, behavior: 'smooth' })
  console.log('updated 0')
  return (
    <div className="overflow-y-auto">
      <SheetOperatorContainer {...sheetOperatorProps} />
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
      <Button onClick={() => setOpen(true)}>快捷编辑</Button>
    </>
  )
}
