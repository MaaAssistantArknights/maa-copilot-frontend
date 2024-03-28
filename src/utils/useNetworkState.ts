import { useState } from 'react'

import { formatError } from 'utils/error'

export interface NetworkState {
  loading: boolean
  error: string | null
}

export const useNetworkState = (initialLoading?: boolean) => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    loading: !!initialLoading,
    error: null,
  })

  const start = () => setNetworkState({ loading: true, error: null })

  const finish = (error?: unknown) => {
    if (error === null || error === undefined) {
      setNetworkState({ loading: false, error: null })
    } else {
      setNetworkState({ loading: false, error: formatError(error) })
    }
  }

  return {
    networkState,
    setNetworkState,
    start,
    finish,
  }
}
