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
import {
  DetailedHTMLProps,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useState,
} from 'react'

import { OperatorAvatar } from '../../EditorOperator'
import { Group, Operator } from '../../EditorSheet'
import {
  SheetContainerSkeleton,
  SheetContainerSkeletonProps,
} from '../SheetContainerSkeleton'
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
  groupName?: string
  operName: string
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
  const { existedOperators, existedGroups } = useSheet()
  const [selectedOperators, setSelectedOperators] = useState<
    OperatorInSheetOperatorEditor[]
  >(
    opers.map(({ name: operName }) => ({
      groupName: name,
      operName,
    })),
  )

  const onSubmit: FormHTMLElement['onSubmit'] = (e) => {
    e.preventDefault()
  }

  const onReset: FormHTMLElement['onReset'] = (e) => {
    // e.preventDefault()
    console.log('111')
    setSelectedOperators(
      opers.map(({ name: operName }) => ({
        groupName: name,
        operName,
      })),
    )
  }

  return (
    <SheetContainerSkeleton title="选择干员" icon="select">
      <form className="mt-3" onSubmit={onSubmit} onReset={onReset}>
        <div className="max-h-96 overflow-y-auto overflow-x-hidden">
          <OperatorSelectorSkeleton
            icon="person"
            title="已选择干员"
            collapseDisabled={!opers.length}
          >
            {opers.map(({ name }) => (
              <OperatorItemInSheetOperatorEditor
                setSelectedOperators={setSelectedOperators}
                selected={
                  !!selectedOperators.find(({ operName }) => operName === name)
                }
                operName={name}
              />
            ))}
          </OperatorSelectorSkeleton>
          <OperatorSelectorSkeleton
            icon="person"
            title="未选择干员"
            collapseDisabled={!existedOperators.length}
          >
            {existedOperators.map(({ name }) => (
              <OperatorItemInSheetOperatorEditor
                operName={name}
                selected={
                  !!selectedOperators.find(({ operName }) => operName === name)
                }
                setSelectedOperators={setSelectedOperators}
              />
            ))}
          </OperatorSelectorSkeleton>
          <OperatorSelectorSkeleton
            icon="people"
            title="其他分组干员"
            collapseDisabled={!existedOperators?.length}
          >
            {existedGroups
              .filter(
                ({ name: existedName, opers }) =>
                  existedName !== name && !!opers?.length,
              )
              .map(({ name: otherGroupName, opers }) => (
                <div key={otherGroupName}>
                  <div className="flex flex-row-reverse items-center">
                    <H6 className="p-0 m-0">{otherGroupName}</H6>
                    <Button
                      minimal
                      icon="arrow-top-left"
                      title="全选"
                      onClick={() =>
                        opers?.forEach(({ name }) => {
                          if (
                            selectedOperators.find(
                              ({ operName }) => operName === name,
                            )
                          )
                            return
                          setSelectedOperators((prev) => [
                            ...prev,
                            { operName: name, groupName: otherGroupName },
                          ])
                        })
                      }
                    />
                  </div>
                  {opers?.map(({ name }) => (
                    <OperatorItemInSheetOperatorEditor
                      operName={name}
                      setSelectedOperators={setSelectedOperators}
                      selected={
                        !!selectedOperators.find(
                          ({ operName }) => operName === name,
                        )
                      }
                    />
                  ))}
                </div>
              ))}
          </OperatorSelectorSkeleton>
        </div>
        <div className="flex p-0.5">
          <Button
            text="确认"
            className={Classes.POPOVER_DISMISS}
            type="submit"
          />
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
        </div>
      </form>
    </SheetContainerSkeleton>
  )
}

const OperatorItemInSheetOperatorEditor: FC<
  {
    selected: boolean
    setSelectedOperators: Dispatch<
      SetStateAction<OperatorInSheetOperatorEditor[]>
    >
  } & OperatorInSheetOperatorEditor
> = ({ selected, operName, groupName, setSelectedOperators }) => {
  const onOperatorSelect = () => {
    setSelectedOperators((prev) =>
      selected
        ? prev.filter(
            ({ operName: selectedOperName }) => selectedOperName !== operName,
          )
        : [...prev, { groupName, operName }],
    )
  }
  return (
    <Card
      interactive={!selected}
      className={clsx(
        selected && 'scale-90 bg-gray-200',
        'w-1/4 p-0.5 flex flex-col items-center cursor-pointer',
      )}
      onClick={onOperatorSelect}
    >
      <OperatorAvatar name={operName} size="large" />
      <p className="font-bold leading-none text-center mt-3 truncate">
        {operName}
      </p>
    </Card>
  )
}

const OperatorSelectorSkeleton: FC<{
  collapseDisabled: boolean
  title: SheetContainerSkeletonProps['title']
  icon: SheetContainerSkeletonProps['icon']
  children: ReactNode
}> = ({ children, collapseDisabled, ...sheetContainerSkeletonProps }) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <SheetContainerSkeleton
      {...sheetContainerSkeletonProps}
      mini
      className="w-96"
      rightOptions={
        <Button
          onClick={() => setIsOpen((prev) => !prev)}
          icon={isOpen ? 'collapse-all' : 'expand-all'}
          title={`${isOpen ? '折叠' : '展开'}所包含干员`}
          minimal
          className="cursor-pointer ml-1"
        />
      }
    >
      <Collapse isOpen={isOpen} className="m-0.5">
        {children}
      </Collapse>
    </SheetContainerSkeleton>
  )
}
