import {
  Button,
  Card,
  Classes,
  Collapse,
  H6,
  Icon,
  Intent,
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
  useMemo,
  useState,
} from 'react'

import { OperatorAvatar } from '../../EditorOperator'
import { Group } from '../../EditorSheet'
import {
  SheetContainerSkeleton,
  SheetContainerSkeletonProps,
} from '../SheetContainerSkeleton'
import { OperatorNoData } from '../SheetNoneData'
import { useSheet } from '../SheetProvider'
import { CollapseButton } from './CollapseButton'

export interface SheetOperatorEditorProp extends SheetOperatorEditorFormProp {}

export const SheetOperatorEditor: FC<SheetOperatorEditorProp> = ({
  ...SheetOperatorEditorFormProps
}) => {
  return (
    <Popover2
      className="w-full"
      content={<SheetOperatorEditorForm {...SheetOperatorEditorFormProps} />}
      position={Position.TOP}
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

const SheetOperatorEditorForm: FC<SheetOperatorEditorFormProp> = ({
  name,
  opers = [],
}) => {
  const {
    existedOperators,
    existedGroups,
    removeOperator,
    submitGroupInSheet,
  } = useSheet()
  const [selectedOperators, setSelectedOperators] = useState<
    OperatorInSheetOperatorEditor[]
  >(
    opers.map(({ name: operName }) => ({
      groupName: name,
      operName,
    })),
  )
  const otherGroups = useMemo(
    () =>
      existedGroups.filter(
        ({ name: existedName, opers }) =>
          existedName !== name && !!opers?.length,
      ),
    [existedGroups, name],
  )

  const onSubmit: DetailedHTMLProps<
    React.FormHTMLAttributes<HTMLFormElement>,
    HTMLFormElement
  >['onSubmit'] = (e) => {
    e.preventDefault()
    const needModifyGroups = selectedOperators.reduce(
      (acc, { groupName, operName }) => {
        const key = groupName || 'noneGrouped'
        if (acc[key]) acc[key].push(operName)
        else acc[key] = [operName]
        return acc
      },
      {} as Record<Group['name'], OperatorInSheetOperatorEditor['operName'][]>,
    )
    let newOpers: Group['opers'] = []
    Object.entries(needModifyGroups).forEach(([key, value]) => {
      if (key === 'noneGrouped') {
        removeOperator(
          value.map((name) => {
            const index = existedOperators.findIndex(
              ({ name: existedName }) => existedName === name,
            )
            newOpers?.push(existedOperators[index])
            return index
          }),
        )
      } else {
        const { opers: otherGroupOpers, ...groupRestField } =
          existedGroups.find(
            ({ name: existedGroups }) => existedGroups === key,
          )!
        newOpers = newOpers?.concat(
          value.map(
            (name) =>
              otherGroupOpers?.find(
                ({ name: existedName }) => existedName === name,
              )!,
          ),
        )
        if (key !== name)
          submitGroupInSheet({
            ...groupRestField,
            opers: otherGroupOpers?.filter(({ name }) => !value.includes(name)),
          })
      }
    })

    submitGroupInSheet({
      ...existedGroups.find(({ name: existedName }) => existedName === name)!,
      opers: newOpers,
    })
  }

  const onReset = () => {
    setSelectedOperators(
      opers.map(({ name: operName }) => ({
        groupName: name,
        operName,
      })),
    )
  }

  return (
    <SheetContainerSkeleton title="选择干员" icon="select">
      <form className="mt-3" onSubmit={onSubmit}>
        <div className="max-h-96 overflow-y-auto overflow-x-hidden">
          <OperatorSelectorSkeleton
            icon="person"
            title="已选择干员"
            collapseDisabled={!opers.length}
          >
            <OperatorSelectorItem
              {...{ selectedOperators, setSelectedOperators, opers }}
            />
          </OperatorSelectorSkeleton>
          <OperatorSelectorSkeleton
            icon="person"
            title="未选择干员"
            collapseDisabled={!existedOperators.length}
          >
            <OperatorSelectorItem
              {...{
                selectedOperators,
                setSelectedOperators,
                opers: existedOperators,
              }}
            />
          </OperatorSelectorSkeleton>
          <OperatorSelectorSkeleton
            icon="people"
            title="其他分组干员"
            collapseDisabled={!otherGroups?.length}
          >
            {otherGroups.map(({ name: otherGroupName, opers }) => (
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
                <OperatorSelectorItem
                  {...{
                    selectedOperators,
                    setSelectedOperators,
                    opers,
                    groupName: otherGroupName,
                  }}
                />
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
                  onClick={onReset}
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

const OperatorSelectorItem: FC<{
  selectedOperators: OperatorInSheetOperatorEditor[]
  setSelectedOperators: Dispatch<
    SetStateAction<OperatorInSheetOperatorEditor[]>
  >
  groupName?: OperatorInSheetOperatorEditor['groupName']
  opers: Group['opers']
}> = ({ selectedOperators, setSelectedOperators, groupName, opers }) => {
  return (
    <div className="flex flex-wrap">
      {opers?.map(({ name }) => {
        const selected = !!selectedOperators.find(
          ({ operName }) => operName === name,
        )
        return (
          <Card
            key={name}
            interactive={!selected}
            className={clsx(
              selected && 'scale-90 bg-gray-200',
              'w-1/4 p-0.5 flex flex-col items-center cursor-pointer',
            )}
            onClick={() => {
              setSelectedOperators((prev) =>
                selected
                  ? prev.filter(
                      ({ operName: selectedOperName }) =>
                        selectedOperName !== name,
                    )
                  : [...prev, { groupName, operName: name }],
              )
            }}
          >
            <OperatorAvatar name={name} size="large" />
            <p className="font-bold leading-none text-center mt-3 truncate">
              {name}
            </p>
          </Card>
        )
      })}
    </div>
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
        <CollapseButton
          isCollapse={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
          disabled={collapseDisabled}
        />
      }
    >
      {collapseDisabled ? (
        OperatorNoData
      ) : (
        <Collapse isOpen={isOpen} className="m-0.5">
          {children}
        </Collapse>
      )}
    </SheetContainerSkeleton>
  )
}
