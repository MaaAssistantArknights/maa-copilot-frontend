import {
  HTMLInputProps,
  NumericInput,
  NumericInputProps,
} from '@blueprintjs/core'

type MixedNumericInputProps = HTMLInputProps & NumericInputProps

export interface NumericInput2Props extends MixedNumericInputProps {
  intOnly?: boolean
}

export const NumericInput2 = ({
  intOnly,
  min,
  onValueChange,
  ...props
}: NumericInput2Props) => {
  const allowNegative = min === undefined || min < 0

  return (
    <NumericInput
      allowNumericCharactersOnly
      min={min}
      onValueChange={(num, str, inputEl) => {
        if (!onValueChange) {
          return
        }

        // count hyphens to determine the sign, so that user can toggle the sign
        // by pressing hyphen key, regardless of the cursor position
        let hyphens = 0

        str = str.replace(/-/g, () => {
          hyphens++
          return ''
        })

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

        onValueChange(num, str, inputEl)
      }}
      {...props}
    />
  )
}
