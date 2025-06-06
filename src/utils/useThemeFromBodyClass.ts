import { useEffect, useState } from 'react'

export function useThemeFromBodyClass(): 'dark' | 'light' {
  const getTheme = () =>
    document.body.classList.contains('dark') ? 'dark' : 'light'

  const [theme, setTheme] = useState<'dark' | 'light'>(getTheme)

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const newTheme = getTheme()
      setTheme((prev) => (prev !== newTheme ? newTheme : prev))
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  return theme
}
