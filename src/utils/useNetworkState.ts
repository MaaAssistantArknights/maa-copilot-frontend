import { useState } from 'react'

export interface NetworkState {
  loading: boolean
  error: Error | null
}

export const useNetworkState = (initialLoading?: boolean) => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    loading: !!initialLoading,
    error: null,
  })

  const start = () => setNetworkState({ loading: true, error: null })

  const finish = (error: Error | null) =>
    setNetworkState({ loading: false, error })

  return {
    networkState,
    setNetworkState,
    start,
    finish,
  }
}
