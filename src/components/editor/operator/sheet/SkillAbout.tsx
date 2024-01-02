import { Button } from '@blueprintjs/core'
import { Popover2 } from '@blueprintjs/popover2'

import { useState } from 'react'

import { CopilotDocV1 } from 'models/copilot.schema'

interface SkillAboutProps {
  operator: CopilotDocV1.Operator
  submitOperator: (value: CopilotDocV1.Operator) => void
}

const SkillAbout = ({ operator, submitOperator }) => {
  return <>111</>
}

export const SkillAboutTrigger = () => {
  const [skillAboutState, setSkillAbout] = useState(false)
  return (
    <Popover2 content={<div>111</div>}>
      <Button text="Open" />
    </Popover2>
  )
}
