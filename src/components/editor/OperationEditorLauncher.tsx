import { Button, Drawer, DrawerSize } from '@blueprintjs/core'
import { OperationEditor } from 'components/editor/OperationEditor'
import { FC, useState } from 'react'

export const OperationEditorLauncher: FC = () => {
  const [editorActive, setEditorActive] = useState(false)

  return (
    <>
      <Drawer
        size={DrawerSize.LARGE}
        isOpen={editorActive}
        onClose={() => setEditorActive(false)}
      >
        <OperationEditor />
      </Drawer>

      <Button
        large
        fill
        icon="open-application"
        onClick={() => setEditorActive(true)}
      >
        启动作业编辑器
      </Button>
    </>
  )
}
