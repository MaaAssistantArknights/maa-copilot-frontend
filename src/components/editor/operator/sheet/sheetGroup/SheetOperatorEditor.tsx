import {
  Button,
  Card,
  CardProps,
  Classes,
  Collapse,
  H3,
  H6,
  Icon,
  Intent,
  NonIdealState,
  Position,
} from '@blueprintjs/core'
import { Popover2 } from '@blueprintjs/popover2'

import clsx from 'clsx'
import { DetailedHTMLProps, FC, useState } from 'react'

import { OperatorAvatar } from '../../EditorOperator'
import { Group, Operator } from '../../EditorSheet'
import { SheetContainerSkeleton } from '../SheetContainerSkeleton'
import { OperatorItem } from '../SheetOperatorItem'
import { useSheet } from '../SheetProvider'
import {
  CollapseButton,
  SheetGroupOperatorSelectProp,
} from './SheetGroupOperatorSelect'

export interface SheetOperatorEditorProp extends SheetOperatorEditorFormProp {}

export const SheetOperatorEditor: FC<SheetOperatorEditorProp> = ({
  ...SheetOperatorEditorFormProps
}) => {
  return (
    <Popover2
      className="w-full"
      content={<SheetOperatorEditorForm {...SheetOperatorEditorFormProps} />}
    >
      <Card
        className="flex items-center justify-center"
        interactive
        title="编辑干员组中干员信息"
      >
        <Icon icon="plus" size={30} />
      </Card>
    </Popover2>
  )
}

type OperatorInSheetOperatorEditor = {
  groupName: string | undefined
  operatorInfo: Operator
  selected: boolean
}

interface SheetOperatorEditorFormProp {
  name: Group['name']
  opers?: Group['opers']
}

type FormHTMLElement = DetailedHTMLProps<
  React.FormHTMLAttributes<HTMLFormElement>,
  HTMLFormElement
>

const SheetOperatorEditorForm: FC<SheetOperatorEditorFormProp> = ({
  name,
  opers = [],
}) => {
  const { existedOperators } = useSheet()
  const [selectedOperators, setSelectedOperators] = useState<
    OperatorInSheetOperatorEditor[]
  >(
    opers.map((item) => ({
      groupName: name,
      operatorInfo: item,
      selected: true,
    })),
  )

  const onSubmit: FormHTMLElement['onSubmit'] = (e) => {
    e.preventDefault()
  }

  return (
    <SheetContainerSkeleton title="选择干员" icon="select">
      <form
        className="flex mt-3"
        onSubmit={onSubmit}
        onReset={() => console.log('222')}
      >
        <Button text="确认" className={Classes.POPOVER_DISMISS} type="submit" />
        <Popover2
          captureDismiss
          content={
            <div className="flex items-center">
              <p>所有未保存的数据均会丢失，确认继续？</p>
              <Button
                type="reset"
                text="继续"
                className={clsx(Classes.POPOVER_DISMISS, 'mx-1')}
              />
              <Button text="取消" className={Classes.POPOVER_DISMISS} />
            </div>
          }
          position={Position.TOP}
        >
          <Button intent={Intent.DANGER} className="ml-1" text="重置" />
        </Popover2>
      </form>
    </SheetContainerSkeleton>
  )
}

const OperatorItemInSheetOperatorEditor: FC<
  {
    selected: boolean
    name: Operator['name']
  } & CardProps
> = ({ selected, name, ...cardProps }) => (
  <Card {...cardProps} className={clsx(selected && 'scale-90 bg-gray-200')}>
    <OperatorAvatar name={name} />
    <p className="font-bold leading-none text-center mt-3 truncate">{name}</p>
  </Card>
)



const OperatorSelectInGroupItem: FC = () => {}
