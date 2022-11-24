import { uniqueId } from 'lodash-es'
import { DeepPartial } from 'react-hook-form'

import { CopilotDocV1 } from '../../../models/copilot.schema'
import { MinimumRequired } from '../../../models/operation'

export const defaultOperation: DeepPartial<CopilotDocV1.Operation> = {
  minimumRequired: MinimumRequired.V4_0_0,
  // the following fields will immediately be set when passed into useForm, even if they are not set by default.
  // so we manually set them in order to check the dirtiness when determining whether the form should be autosaved.
  actions: [],
  doc: {},
  groups: [],
  opers: [],
}

export const defaultOperator: CopilotDocV1.Operator = {
  name: '未定义',
}

export const defaultGroup: CopilotDocV1.Group = {
  name: '未定义',
  opers: [],
}

export const defaultAction: CopilotDocV1.Action = {
  type: CopilotDocV1.Type.Deploy,
}

export const createOperator = (): CopilotDocV1.Operator => ({
  _id: uniqueId(),
  ...defaultOperator,
})

export const createGroup = (): CopilotDocV1.Group => ({
  _id: uniqueId(),
  ...defaultOperator,
})

export const createDefaultAction = (): CopilotDocV1.Action => ({
  _id: uniqueId(),
  ...defaultAction,
})
