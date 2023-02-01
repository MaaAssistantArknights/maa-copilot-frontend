import { Button } from '@blueprintjs/core'

import { useEffect, useState } from 'react'

export const BackToTop = () => {
  const [showButton, setShowButton] = useState(false)
  useEffect(() => {
    document.addEventListener('scroll', () => {
      if (window.pageYOffset > 100) {
        setShowButton(true)
      } else {
        setShowButton(false)
      }
    })
  }, [])
  const handleClickButton = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  return (
    <div>
      {showButton && (
        <Button
          onClick={handleClickButton}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
          }}
          icon="symbol-triangle-up"
        />
      )}
    </div>
  )
}
