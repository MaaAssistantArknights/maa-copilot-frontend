import { CopilotDocV1 } from 'models/copilot.schema'

import { EditorPerformerGroupProps } from '../EditorPerformerGroup'
import { SheetContainerSkeleton } from './SheetContainerSkeleton'

type Groups = CopilotDocV1.Group[]
type Operators = CopilotDocV1.Operator[]

export interface SheetGroupProps {
  submitGroup: EditorPerformerGroupProps['submit']
  existedGroups: Groups
  existedOperators: Operators
}

const SheetGroup = ({ submitGroup, existedGroups }: SheetGroupProps) => {
  return (
    <div>
      <p>part of group</p>
    </div>
  )
}

export const SheetGroupContainer = (sheetGroupProps: SheetGroupProps) => (
  <SheetContainerSkeleton title="设置分组" icon="people">
    <SheetGroup {...sheetGroupProps} />
  </SheetContainerSkeleton>
)
