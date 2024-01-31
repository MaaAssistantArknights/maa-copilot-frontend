import { useParams } from 'react-router-dom'

import { OperationViewer } from 'components/viewer/OperationViewer'

export const ViewPage = () => {
  const { id } = useParams()
  return <OperationViewer operationId={id!} onCloseDrawer={() => {}} />
}
