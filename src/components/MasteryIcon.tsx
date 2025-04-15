import { FC } from 'react'

interface MasteryIconProps extends React.SVGProps<SVGSVGElement> {
  mastery: number
}

export const MasteryIcon: FC<MasteryIconProps> = ({ mastery, ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" {...props}>
      <circle
        className={mastery >= 1 ? '' : 'sub-circle'}
        cx="50"
        cy="27"
        r="22"
        fill={mastery >= 1 ? 'currentColor' : '#898989'}
      />
      <circle
        className={mastery >= 2 ? '' : 'sub-circle'}
        cx="75"
        cy="70"
        r="22"
        fill={mastery >= 2 ? 'currentColor' : '#898989'}
      />
      <circle
        className={mastery >= 3 ? '' : 'sub-circle'}
        cx="25"
        cy="70"
        r="22"
        fill={mastery >= 3 ? 'currentColor' : '#898989'}
      />
    </svg>
  )
}
