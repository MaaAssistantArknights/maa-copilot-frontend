import {
  HTMLInputProps,
  NumericInput,
  NumericInputProps,
} from '@blueprintjs/core'

import {
  WheelEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

type MixedNumericInputProps = HTMLInputProps & NumericInputProps

export interface NumericInput2Props extends MixedNumericInputProps {
  intOnly?: boolean
  onWheelFocused?: (e: React.WheelEvent<HTMLInputElement>) => void
  wheelStepSize?: number
}

export const NumericInput2 = ({
  intOnly,
  min,
  minorStepSize,
  value,
  onValueChange,
  onWheelFocused,
  wheelStepSize,
  ...props
}: NumericInput2Props) => {
  const allowNegative = min === undefined || min < 0

  const onWheelFocusedRef = useRef(onWheelFocused)
  onWheelFocusedRef.current = onWheelFocused
  const onValueChangeRef = useRef(onValueChange)
  onValueChangeRef.current = onValueChange
  const wheelStepSizeRef = useRef(wheelStepSize)
  wheelStepSizeRef.current = wheelStepSize
  const valueRef = useRef(value)
  valueRef.current = value

  const handleWheelRegistered = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [endsWithDot, setEndsWithDot] = useState(false)

  if (minorStepSize && minorStepSize < 0.001) {
    // not yet fixed in current version: https://github.com/palantir/blueprint/issues/4497
    process.env.NODE_ENV === 'development' &&
      console.warn('minorStepSize cannot be smaller than 0.001')

    minorStepSize = 0.001
  }

  const handleWheel: WheelEventHandler<HTMLInputElement> = useCallback((e) => {
    onWheelFocusedRef.current?.(e)
    if (wheelStepSizeRef.current) {
      e.preventDefault()
      const newValue =
        (Number(valueRef.current) || 0) -
        Math.sign(e.deltaY) * wheelStepSizeRef.current

      if (newValue !== valueRef.current) {
        onValueChangeRef.current?.(newValue, String(newValue), inputRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (handleWheelRegistered.current) {
      inputRef.current?.removeEventListener('wheel', handleWheel as any)
      handleWheelRegistered.current = false
    }
  }, [handleWheel])

  return (
    <NumericInput
      allowNumericCharactersOnly
      min={min}
      minorStepSize={minorStepSize}
      inputRef={inputRef}
      value={endsWithDot ? value + '.' : value}
      onFocus={(e) => {
        if (
          (onWheelFocused || wheelStepSize !== undefined) &&
          !handleWheelRegistered.current
        ) {
          handleWheelRegistered.current = true
          e.currentTarget.addEventListener('wheel', handleWheel as any, {
            passive: false,
          })
        }
      }}
      onBlur={() => {
        setEndsWithDot(false)
        if (handleWheelRegistered.current) {
          inputRef.current?.removeEventListener('wheel', handleWheel as any)
          handleWheelRegistered.current = false
        }
      }}
      onButtonClick={(num, str) => onValueChange?.(num, str, inputRef.current)}
      onValueChange={(num, str, inputEl) => {
        // count hyphens to determine the sign, so that user can toggle the sign
        // by pressing hyphen key, regardless of the cursor position
        let hyphens = 0

        str = str.replace(/-/g, () => {
          hyphens++
          return ''
        })

        const dots = str.split('.').length - 1

        if (dots > 1 || (dots === 1 && intOnly)) {
          return
        }

        setEndsWithDot(str.endsWith('.'))

        num = parseFloat(str)

        if (Number.isNaN(num) || !Number.isFinite(num)) {
          return
        }

        if (allowNegative && hyphens % 2 === 1) {
          num = -num
        }

        if (intOnly) {
          num = ~~num
        }

        onValueChange?.(num, str, inputEl)
      }}
      {...props}
    />
  )
}
