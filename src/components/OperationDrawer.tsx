import { Drawer, DrawerSize } from '@blueprintjs/core'

import { useSearchParams } from 'react-router-dom'

import { OperationViewer } from 'components/viewer/OperationViewer'

export function OperationDrawer() {
  const [searchParams, setSearchParams] = useSearchParams()
  const operationId = +(searchParams.get('op') || NaN) || undefined

  const close = () => {
    setSearchParams((params) => {
      params.delete('op')
      return params
    })
  }

  return (
    <Drawer size={DrawerSize.LARGE} isOpen={!!operationId} onClose={close}>
      {operationId && (
        <OperationViewer operationId={operationId} onCloseDrawer={close} />
      )}
    </Drawer>
  )
}
