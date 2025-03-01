import { useMemo } from 'react'
import { useWindowSize } from 'react-use'

// https://tailwindcss.com/docs/container
export const useCurrentSize = () => {
  const { width } = useWindowSize()

  return useMemo(
    () => ({
      isSM: width < 640,
      isMD: width < 768,
      isLG: width < 1024,
      isXL: width < 1280,
      is2XL: width < 1536,
    }),
    [width],
  )
}
