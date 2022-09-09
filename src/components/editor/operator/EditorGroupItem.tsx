import { MenuItem } from '@blueprintjs/core'

interface EditorGroupItemProps {
  group: CopilotDocV1.Group
}

export const EditorGroupItem = ({ group }: EditorGroupItemProps) => {
  return (
    <div className="">
      <MenuItem key={group.name} text={group.name} />
    </div>
  )
}
