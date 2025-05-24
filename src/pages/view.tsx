import { useNavigate, useParams } from 'react-router-dom'

import { OperationViewer } from 'components/viewer/OperationViewer'

export const ViewPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  if (!id) {
    navigate('/')
    return null
  }

  return (
    <div className="pb-16">
      <OperationViewer operationId={+id} onCloseDrawer={() => {}} />
    </div>
  )
}
