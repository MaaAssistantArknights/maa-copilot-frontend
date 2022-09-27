import { Button, Drawer } from '@blueprintjs/core'

import { FC, useState } from 'react'

import { OperationUploader } from 'components/uploader/OperationUploader'

export const OperationUploaderLauncher: FC = () => {
  const [uploaderActive, setUploaderActive] = useState(false)

  return (
    <>
      <Drawer
        size="560px"
        isOpen={uploaderActive}
        onClose={() => setUploaderActive(false)}
      >
        <OperationUploader />
      </Drawer>

      <Button
        large
        fill
        icon="cloud-upload"
        onClick={() => setUploaderActive(true)}
      >
        上传已有作业
      </Button>
    </>
  )
}
