import {
  Button,
  ButtonProps,
  Card,
  CardProps,
  Divider,
  H3,
  Icon,
  NonIdealState,
} from '@blueprintjs/core'
import { Tooltip2 } from '@blueprintjs/popover2'

import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { UseFieldArrayRemove, UseFormSetError } from 'react-hook-form'

import { CopilotDocV1 } from 'models/copilot.schema'
import { OPERATORS, PROFESSIONS } from 'models/generated/operators'

import { OperatorAvatar } from '../EditorOperator'
import { EditorPerformerOperatorProps } from '../EditorPerformerOperator'
import { EventType, SkillAboutProps, SkillAboutTrigger } from './SkillAbout'

type Operator = CopilotDocV1.Operator

export interface SheetOperatorProps {
  submitOperator: EditorPerformerOperatorProps['submit']
  existedOperators: Operator[]
  removeOperator: UseFieldArrayRemove
}
const SheetOperator = ({
  submitOperator,
  existedOperators,
  removeOperator,
}: SheetOperatorProps) => {
  // TODO: 添加标记查询逻辑
  const defaultSubProf = useMemo(
    () => [
      { id: 'all', name: '全部' },
      { id: 'fav', name: '收藏' },
      { id: 'selected', name: '已选择' },
    ],
    [],
  )
  const formattedProfessions = useMemo(
    () => [
      {
        id: 'all',
        name: '全部',
        sub: [],
      },
      ...PROFESSIONS,
      {
        id: 'others',
        name: '其它',
        sub: [],
      },
    ],
    [],
  )

  const [selectedProf, setSelectedProf] = useState(formattedProfessions[0])
  const [selectedSubProf, setSelectedSubProf] = useState(defaultSubProf[2])

  const checkOperatorState = (target: string) =>
    existedOperators.find((item) => item.name === target) ? true : false

  const formattedSubProfessions = useMemo(
    () => [...defaultSubProf, ...selectedProf.sub],
    [selectedProf],
  )
  const operatorsGroupedByProf = useMemo(() => {
    // 处理自命名干员
    const allOperators = [
      ...OPERATORS,
      ...existedOperators
        .filter(
          (item) => !OPERATORS.find((opItem) => opItem.name === item.name),
        )
        .map(({ name }) => {
          return {
            name,
            id: name,
            pron: '',
            subProf: '',
          }
        }),
    ]
    if (selectedProf.id === 'all') return allOperators
    if (selectedProf.id === 'others')
      return OPERATORS.filter(
        (item) => item.subProf === 'notchar1' || !item.pron || !item.subProf,
      )
    return OPERATORS.filter(
      (op) => !!selectedProf.sub.find((item) => item.id === op.subProf),
    )
  }, [selectedProf])

  const operatorsGroupedBySubProf = useMemo(() => {
    if (selectedSubProf.id === 'all') return operatorsGroupedByProf
    else if (selectedSubProf.id === 'selected')
      return operatorsGroupedByProf.filter((item) =>
        checkOperatorState(item.name),
      )
    else
      return operatorsGroupedByProf.filter(
        (item) => item.subProf === selectedSubProf.id,
      )
  }, [selectedSubProf, selectedProf])

  const eventHandleProxy = (
    type: EventType,
    value: Operator,
    setError?: UseFormSetError<CopilotDocV1.Operator>,
  ) => {
    switch (type) {
      case 'box':
        if (value._id)
          removeOperator(
            existedOperators.findIndex((item) => item._id === value._id),
          )
        else submitOperator(value, () => {})
        break
      case 'pin':
        console.log('building')
        break
      case 'skill':
        submitOperator(value, setError!, true)
    }
  }
  return (
    <div className="flex">
      <div className="flex-auto">
        <div className="sticky top-0 h-screen">
          {operatorsGroupedBySubProf.length ? (
            <div
              className="flex flex-wrap flex-col py-5 items-start content-start h-full min-h-500px overflow-x-auto overscroll-contain"
              onWheel={(e) => (e.currentTarget.scrollLeft += e.deltaY)}
            >
              {operatorsGroupedBySubProf.map((operatorInfo) => {
                const operatorDetail = existedOperators.find(
                  (item) => item.name === operatorInfo.name,
                )
                return (
                  <div className="flex items-center w-1/4 mb-1 px-0.5">
                    <OperatorItem
                      key={operatorInfo.name}
                      pinned={false}
                      selected={checkOperatorState(operatorInfo.name)}
                      submitOperator={eventHandleProxy}
                      operator={operatorDetail}
                      {...operatorInfo}
                    />
                  </div>
                )
              })}
            </div>
          ) : (
            <NonIdealState
              description="暂无相关干员"
              icon="issue"
              title="无"
              className="flex-auto my-auto"
            />
          )}
        </div>
      </div>
      <Divider />
      <div className="flex flex-row-reverse pt-1 shrink-0">
        <div>
          {formattedProfessions.map((prof) => (
            <ButtonItem
              title={prof.name}
              icon="people"
              minimal
              key={prof.id}
              active={prof.id === selectedProf.id}
              onClick={() => {
                setSelectedProf(prof)
                setSelectedSubProf(defaultSubProf[0])
              }}
            />
          ))}
        </div>
        <div className="ml-1">
          {formattedSubProfessions?.map((subProf) => (
            <ButtonItem
              title={subProf.name}
              icon="people"
              fill
              key={subProf.id}
              active={subProf.id === selectedSubProf.id}
              minimal
              onClick={() => setSelectedSubProf(subProf)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export const SheetOperatorContainer = (
  sheetOperatorProp: SheetOperatorProps,
) => (
  <div>
    <div className="flex items-center pl-3 my-5">
      <div className="flex items-center">
        <Icon icon="person" size={20} />
        <H3 className="p-0 m-0 ml-3">选择干员</H3>
      </div>
    </div>
    <Divider />
    <SheetOperator {...sheetOperatorProp} />
  </div>
)

interface MenuItemProps extends ButtonProps {
  title: string
}

const ButtonItem = ({ title, icon, ...buttonProps }: MenuItemProps) => (
  <Button {...buttonProps} className="text-center">
    <Icon icon={icon} />
    <p>{title}</p>
  </Button>
)

interface OperatorItemPorps extends CardProps, SkillAboutProps {
  id: string
  name: string
  selected: boolean
  pinned: boolean
}

const OperatorItem = ({
  id,
  selected,
  name,
  pinned,
  operator,
  submitOperator,
  ...cardProps
}: OperatorItemPorps) => (
  <Card
    className={clsx(
      'flex flex-col justify-center items-center w-full p-0 relative cursor-pointer',
      selected && 'scale-95 bg-gray-200',
    )}
    interactive={!selected}
    onClick={() => submitOperator('box', operator || { name })}
    {...cardProps}
  >
    <OperatorAvatar id={id} size="large" />
    <h3 className="font-bold leading-none text-center mt-3 w-full truncate">
      {name}
    </h3>
    <SkillAboutTrigger {...{ operator, submitOperator }} />
    <Tooltip2
      content={`将 ${name} ${
        pinned ? '移出' : '添加至'
      }我的收藏（会保留技能设置）`}
      hoverOpenDelay={600}
      className="absolute top-1 right-1"
    >
      <Icon
        icon={pinned ? 'pin' : 'unpin'}
        className={clsx(
          'hover:scale-150',
          pinned ? '-rotate-45 transform-gpu' : 'text-gray-500',
        )}
        onClick={(e) => {
          e.stopPropagation()
          submitOperator('pin', operator || { name })
        }}
      />
    </Tooltip2>
  </Card>
)
