import { useMemo } from 'react'
import { useWindowSize } from 'react-use'

// https://tailwindcss.com/docs/container
export const useCurrentSize = () => {
  const { width } = useWindowSize()

  const isSM = useMemo(() => width < 640, [width])
  const isMD = useMemo(() => width >= 640 && width < 768, [width])
  const isLG = useMemo(() => width >= 768 && width < 1024, [width])
  const isXL = useMemo(() => width >= 1024 && width < 1280, [width])
  const is2XL = useMemo(() => width >= 1280 && width < 1536, [width])

  return { isSM, isMD, isLG, isXL, is2XL }
}
