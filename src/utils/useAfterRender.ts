import { useEffect, useRef } from 'react'

type AfterRenderCallback = () => void

/**
 * Behaves (almost?) the same as Vue's nextTick.
 *
 * @example
 * const { afterRender } = useAfterRender()
 *
 * useEffect(() => {
 *  afterRender(() => console.log('This will be called in the next render'))
 * }, [someDeps])
 *
 * const someEventHandler = async () => {
 *   await afterRender()
 *   console.log('This will be called in the next render')
 * }
 */
export function useAfterRender() {
  type Listener = () => void
  const listeners = useRef<Listener[]>([])

  const afterRender = (callback?: AfterRenderCallback) => {
    return new Promise<void>((resolve) => {
      listeners.current.push(() => {
        if (callback) callback()
        resolve()
      })
    })
  }

  useEffect(() => {
    if (listeners.current.length > 0) {
      listeners.current.forEach((listener) => listener())
      listeners.current = []
    }
  })

  return { afterRender }
}
