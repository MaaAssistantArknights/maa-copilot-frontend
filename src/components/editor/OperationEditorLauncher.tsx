import { Button } from '@blueprintjs/core'

import { FC } from 'react'
import { Link } from 'react-router-dom'

export const OperationEditorLauncher: FC = () => {
  return (
    <>
      <Link to="/create" className="!no-underline">
        <Button large fill icon="open-application">
          启动作业编辑器
        </Button>
      </Link>
    </>
  )
}
