import { FC, useMemo } from 'react'
import { useLocation } from 'react-router-dom'

export const AccountActivatePage: FC = () => {
  const location = useLocation()

  const token = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return params.get('token')
  }, [location])

  return (
    <div>
      <h1>AccountActivatePage</h1>
      <p>token: {token}</p>
    </div>
  )
}
