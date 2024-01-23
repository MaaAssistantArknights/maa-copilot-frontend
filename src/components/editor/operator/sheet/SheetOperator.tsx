import {
  Button,
  ButtonProps,
  Divider,
  Icon,
  Intent,
  NonIdealState,
} from '@blueprintjs/core'

import { useMemo, useState } from 'react'
import { UseFieldArrayRemove, UseFormSetError } from 'react-hook-form'

import { AppToaster } from 'components/Toaster'
import { CopilotDocV1 } from 'models/copilot.schema'
import { OPERATORS, PROFESSIONS } from 'models/generated/operators'

import { EditorPerformerOperatorProps } from '../EditorPerformerOperator'
import { SheetContainerSkeleton } from './SheetContainerSkeleton'
import { OperatorItem } from './SheetOperatorItem'
import { EventType } from './SkillAbout'

type Operator = CopilotDocV1.Operator
type Group = CopilotDocV1.Group

export interface SheetOperatorProps {
  submitOperator: EditorPerformerOperatorProps['submit']
  existedOperators: Operator[]
  existedGroups: Group[]
  removeOperator: UseFieldArrayRemove
}
const SheetOperator = ({
  submitOperator,
  existedOperators,
  removeOperator,
  existedGroups,
}: SheetOperatorProps) => {
  const defaultSubProf = useMemo(
    () => [
      { id: 'all', name: '全部' },
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
  const [selectedSubProf, setSelectedSubProf] = useState(defaultSubProf[0])

  const checkOperatorSelected = (target: string) => {
    if (existedOperators.find((item) => item.name === target)) return true
    else {
      return existedGroups
        .map((item) => item.opers)
        .flat()
        .find((item) => item?.name === target)
        ? true
        : false
    }
  }

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
      return allOperators.filter(
        (item) => item.subProf === 'notchar1' || !item.pron || !item.subProf,
      )
    return allOperators.filter(
      (op) => !!selectedProf.sub.find((item) => item.id === op.subProf),
    )
  }, [selectedProf])

  const operatorsGroupedBySubProf = useMemo(() => {
    if (selectedSubProf.id === 'all') return operatorsGroupedByProf
    else if (selectedSubProf.id === 'selected')
      return operatorsGroupedByProf.filter((item) =>
        checkOperatorSelected(item.name),
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
      case 'box': {
        if (checkOperatorSelected(value.name))
          if (existedOperators.find((item) => item.name === value.name))
            removeOperator(
              existedOperators.findIndex((item) => item._id === value._id),
            )
          else
            AppToaster().show({
              message: '该干员已被编组',
              intent: Intent.DANGER,
            })
        else submitOperator(value, () => {})
        break
      }
      case 'skill': {
        submitOperator(value, setError!, true)
        break
      }
    }
  }
  return (
    <div className="flex relative">
      {/* TODO: 施工中 */}
      <div className="absolute bottom-full right-1">111</div>

      <div className="flex-auto">
        <div className="sticky top-0 h-screen">
          {operatorsGroupedBySubProf.length ? (
            <div
              key="operatorContainer"
              className="flex flex-wrap flex-col py-5 items-start content-start h-full min-h-500px overflow-x-auto overscroll-contain"
              onWheel={(e) => (e.currentTarget.scrollLeft += e.deltaY)}
            >
              {operatorsGroupedBySubProf.map((operatorInfo) => {
                const operatorDetail = existedOperators.find(
                  (item) => item.name === operatorInfo.name,
                )
                return (
                  <div
                    className="flex items-center mb-1 w-32 px-0.5"
                    key={operatorInfo.name}
                  >
                    <OperatorItem
                      selected={checkOperatorSelected(operatorInfo.name)}
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
  <SheetContainerSkeleton title="选择干员" icon="person">
    <SheetOperator {...sheetOperatorProp} />
  </SheetContainerSkeleton>
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
