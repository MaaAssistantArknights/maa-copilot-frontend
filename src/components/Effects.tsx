import { useAtom } from 'jotai'
import { FC, useEffect } from 'react'
import { authAtom } from 'store/auth'
import { FETCHER_CONFIG } from '../utils/fetcher'

export const Effects: FC = () => {
  const [auth] = useAtom(authAtom)

  useEffect(() => {
    console.log('auth', auth)
    FETCHER_CONFIG.apiToken = auth?.token
  }, [auth])

  return null
}
