import {
  HTMLInputProps,
  NumericInput,
  NumericInputProps,
} from '@blueprintjs/core'
import { useRef, useState } from 'react'

type MixedNumericInputProps = HTMLInputProps & NumericInputProps

export interface NumericInput2Props extends MixedNumericInputProps {
  intOnly?: boolean
}

export const NumericInput2 = ({
  intOnly,
  min,
  minorStepSize,
  value,
  onValueChange,
  ...props
}: NumericInput2Props) => {
  const allowNegative = min === undefined || min < 0

  const inputRef = useRef<HTMLInputElement>(null)
  const [endsWithDot, setEndsWithDot] = useState(false)

  if (minorStepSize && minorStepSize < 0.001) {
    // not yet fixed in current version: https://github.com/palantir/blueprint/issues/4497
    process.env.NODE_ENV === 'development' &&
      console.warn('minorStepSize cannot be smaller than 0.001')

    minorStepSize = 0.001
  }

  return (
    <NumericInput
      allowNumericCharactersOnly
      min={min}
      minorStepSize={minorStepSize}
      inputRef={inputRef}
      value={endsWithDot ? value + '.' : value}
      onBlur={() => setEndsWithDot(false)}
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
