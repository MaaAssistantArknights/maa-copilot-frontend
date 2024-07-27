import { Button, ButtonProps } from '@blueprintjs/core'

import { FC } from 'react'

import { Group, Operator } from '../../EditorSheet'
import { GroupListModifyProp } from '../SheetGroup'

export interface SheetGroupOperatorSelectProp {
  existedOperator?: Operator[]
  existedGroup?: Group[]
  groupInfo: Group
  groupUpdateHandle?: GroupListModifyProp['groupUpdateHandle']
}

interface CollapseButtonProps {
  isCollapse: boolean
  onClick: ButtonProps['onClick']
  disabled?: ButtonProps['disabled']
}

export const CollapseButton: FC<CollapseButtonProps> = ({
  isCollapse,
  onClick,
  disabled,
}) => (
  <Button
    icon={isCollapse ? 'collapse-all' : 'expand-all'}
    title={`${isCollapse ? '折叠' : '展开'}所包含干员`}
    minimal
    className="cursor-pointer ml-1"
    disabled={disabled}
    onClick={onClick}
  />
)
