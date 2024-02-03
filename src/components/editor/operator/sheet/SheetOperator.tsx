import {
  Button,
  ButtonProps,
  Divider,
  H6,
  Icon,
  Intent,
} from '@blueprintjs/core'

import clsx from 'clsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import { UseFieldArrayRemove, UseFormSetError } from 'react-hook-form'

import { AppToaster } from 'components/Toaster'
import { CopilotDocV1 } from 'models/copilot.schema'
import { OPERATORS, PROFESSIONS } from 'models/operator'

import { EditorPerformerOperatorProps } from '../EditorPerformerOperator'
import { Group, Operator } from '../EditorSheet'
import { SheetContainerSkeleton } from './SheetContainerSkeleton'
import { OperatorNoData } from './SheetNoneData'
import { OperatorItem } from './SheetOperatorItem'
import { EventType } from './SheetOperatorSkillAbout'

export interface SheetOperatorProps {
  submitOperator: EditorPerformerOperatorProps['submit']
  existedOperators: Operator[]
  existedGroups: Group[]
  removeOperator: UseFieldArrayRemove
  miniMedia?: boolean
}
const SheetOperator = ({
  submitOperator,
  existedOperators,
  removeOperator,
  existedGroups,
  miniMedia,
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
      return !!existedGroups
        .map((item) => item.opers)
        .flat()
        .find((item) => item?.name === target)
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
            id: '',
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

  const selectedAllState = useMemo(
    () => !defaultSubProf.find(({ id }) => id === selectedSubProf.id),
    [selectedSubProf],
  )

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
            AppToaster.show({
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
  const selectAll = () => {
    operatorsGroupedBySubProf.forEach((item) => {
      submitOperator(item, () => {})
    })
  }

  const ProfSelect = useMemo(
    () => (
      <div className="flex flex-row-reverse pt-1 shrink-0">
        <div>
          {formattedProfessions.map((prof) => (
            <ButtonItem
              title={prof.name}
              icon="people"
              key={prof.id}
              active={prof.id === selectedProf.id}
              miniMedia={!!miniMedia}
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
              miniMedia={!!miniMedia}
              icon="people"
              fill
              key={subProf.id}
              active={subProf.id === selectedSubProf.id}
              onClick={() => setSelectedSubProf(subProf)}
            />
          ))}
        </div>
      </div>
    ),
    [selectedSubProf, selectedProf],
  )

  const SelectAll = useMemo(
    () => (
      <>
        {selectedAllState && (
          <H6
            className="absolute bottom-full right-0 p-3 cursor-pointer m-0"
            onClick={selectAll}
          >
            全选
          </H6>
        )}
      </>
    ),
    [selectedAllState, selectAll],
  )

  // optimization of operators' list use simple delay slice
  const [sliceIndex, setSliceIndex] = useState(50)
  const sliceTimer = useRef<number | undefined>(undefined)
  useEffect(() => {
    if (operatorsGroupedByProf.length > sliceIndex)
      sliceTimer.current = window.setTimeout(
        () => setSliceIndex(operatorsGroupedBySubProf.length),
        100,
      )
    else {
      clearTimeout(sliceTimer.current)
      setSliceIndex(50)
    }
  }, [operatorsGroupedBySubProf.length])

  return (
    <div className="flex relative">
      {SelectAll}
      <div className="flex-auto">
        <div className="sticky top-0 h-screen">
          {operatorsGroupedBySubProf.length ? (
            <div
              key="operatorContainer"
              className="flex flex-wrap flex-col p-1 items-start content-start h-full min-h-500px overflow-x-auto overscroll-contain"
              onWheel={(e) => (e.currentTarget.scrollLeft += e.deltaY)}
            >
              {operatorsGroupedBySubProf
                .slice(0, sliceIndex)
                .map(({ name: operatorInfoName }, index) => {
                  const operatorDetail = existedOperators.find(
                    ({ name }) => name === operatorInfoName,
                  )
                  return (
                    <div
                      className="flex items-center w-32 h-30 flex-0"
                      key={index}
                    >
                      <OperatorItem
                        selected={checkOperatorSelected(operatorInfoName)}
                        submitOperator={eventHandleProxy}
                        operator={operatorDetail}
                        name={operatorInfoName}
                      />
                    </div>
                  )
                })}
            </div>
          ) : (
            OperatorNoData
          )}
        </div>
      </div>
      <Divider />
      {ProfSelect}
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
  miniMedia: boolean
}

const ButtonItem = ({
  title,
  icon,
  miniMedia,
  ...buttonProps
}: MenuItemProps) => (
  <Button {...buttonProps} className="text-center" minimal>
    <Icon icon={icon} />
    <p className={clsx(miniMedia && 'w-5 truncate')}>{title}</p>
  </Button>
)
