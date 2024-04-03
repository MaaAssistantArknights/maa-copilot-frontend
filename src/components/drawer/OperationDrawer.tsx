import { Drawer, DrawerSize } from '@blueprintjs/core'

import { useSearchParams } from 'react-router-dom'

import { OperationSetViewer } from 'components/viewer/OperationSetViewer'
import { OperationViewer } from 'components/viewer/OperationViewer'

export function OperationDrawer() {
  const [searchParams, setSearchParams] = useSearchParams()
  const operationId = +(searchParams.get('op') || NaN) || undefined
  const operationSetId = +(searchParams.get('opset') || NaN) || undefined

  const closeOperation = () => {
    setSearchParams((params) => {
      params.delete('op')
      return params
    })
  }

  const closeOperationSet = () => {
    setSearchParams((params) => {
      params.delete('opset')
      return params
    })
  }

  if (operationSetId) {
    return (
      <Drawer
        size={DrawerSize.LARGE}
        isOpen={!!operationSetId}
        onClose={closeOperationSet}
      >
        {operationSetId && (
          <OperationSetViewer
            operationSetId={operationSetId}
            onCloseDrawer={closeOperationSet}
          />
        )}

        <Drawer
          usePortal={false} // 嵌套 Drawer 时需要关闭 Portal
          size={DrawerSize.LARGE}
          isOpen={!!operationId}
          onClose={closeOperation}
        >
          {operationId && (
            <OperationViewer
              operationId={operationId}
              onCloseDrawer={closeOperation}
            />
          )}
        </Drawer>
      </Drawer>
    )
  }

  return (
    <Drawer
      size={DrawerSize.LARGE}
      isOpen={!!operationId}
      onClose={closeOperation}
    >
      {operationId && (
        <OperationViewer
          operationId={operationId}
          onCloseDrawer={closeOperation}
        />
      )}
    </Drawer>
  )
}
