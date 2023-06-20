import { useParams } from 'react-router-dom'

import { OperationViewer } from 'components/viewer/OperationViewer'

export const ViewPage = () => {
  const { id } = useParams()
  if (!id) throw 'empty'
  return <OperationViewer operationId={id} onCloseDrawer={() => {}} />
}
