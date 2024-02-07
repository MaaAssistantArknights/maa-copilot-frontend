import { Button, Divider, H4, H5, H6, Intent } from '@blueprintjs/core'

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

const paginationSize = 60

const SheetOperator = ({
  submitOperator,
  existedOperators,
  removeOperator,
  existedGroups,
  miniMedia,
}: SheetOperatorProps) => {
  // media warning
  useEffect(() => {
    return () => {
      if (miniMedia)
        AppToaster.show({
          intent: 'warning',
          message: '推荐使用大屏幕进行编辑(宽度>600px)!',
        })
    }
  }, [])

  const operatorScrollRef = useRef<HTMLDivElement>(null)

  const defaultProf = useMemo(
    () => [
      {
        id: 'all',
        name: '全部',
        sub: [],
      },
      {
        id: 'others',
        name: '其它',
        sub: [],
      },
    ],
    [],
  )
  const defaultSubProf = useMemo(
    () => [
      { id: 'all', name: '全部' },
      { id: 'selected', name: '已选择' },
    ],
    [],
  )
  const formattedProfessions = useMemo(() => {
    const [all, ...other] = defaultProf
    return [all, ...PROFESSIONS, ...other]
  }, [])

  const [selectedProf, setSelectedProf] = useState(formattedProfessions[0])
  const [selectedSubProf, setSelectedSubProf] = useState(defaultSubProf[0])

  const [formattedSubProfessions, operatorsGroupedByProf] = useMemo(
    () => [
      // handle other operators
      [...defaultSubProf, ...(selectedProf.sub || [])],
      [
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
      ].filter((item) => {
        if (selectedProf.id === defaultSubProf[0].id) return true
        else if (selectedProf.id === defaultSubProf[1].id)
          return item.subProf === 'notchar1' || !item.pron || !item.subProf
        else return !!selectedProf.sub?.find((op) => op.id === item.subProf)
      }),
    ],
    [selectedProf],
  )

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

  const checkOperatorSelected = (target: string) => {
    if (existedOperators.find((item) => item.name === target)) return true
    else {
      return !!existedGroups
        .map((item) => item.opers)
        .flat()
        .find((item) => item?.name === target)
    }
  }

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

  // pagination about
  const [pageIndex, setPageIndex] = useState(0)
  const [lastIndex, noMore, backToTop, canEclipse] = useMemo(() => {
    const lastIndex = (pageIndex + 1) * paginationSize
    return [
      lastIndex,
      lastIndex >= operatorsGroupedBySubProf.length,
      lastIndex > paginationSize,
      operatorsGroupedBySubProf.length > paginationSize,
    ]
  }, [pageIndex, operatorsGroupedBySubProf.length])

  const resetPaginationState = () => {
    setPageIndex(0)
    operatorScrollRef?.current?.scrollIntoView()
  }

  useEffect(resetPaginationState, [selectedProf, selectedSubProf])

  const selectAll = () => {
    operatorsGroupedBySubProf.forEach((item) => {
      submitOperator(item, () => {})
    })
  }

  const cancelAll = () => {
    const deleteIndexList: number[] = []
    operatorsGroupedBySubProf.forEach(({ name }) => {
      const index = existedOperators.findIndex((item) => item.name === name)
      if (index !== -1) deleteIndexList.push(index)
    })
    removeOperator(deleteIndexList)
  }

  const [selectAllState, cancelAllState] = useMemo(
    () => [
      !operatorsGroupedBySubProf.every(({ name }) =>
        checkOperatorSelected(name),
      ),
      operatorsGroupedBySubProf.some(({ name }) => checkOperatorSelected(name)),
    ],
    [operatorsGroupedBySubProf, existedOperators],
  )

  const ActionList = (
    <div className="absolute bottom-0">
      <Button
        minimal
        icon="circle"
        disabled={!cancelAllState}
        title={`取消选择全部${existedOperators.length}位干员`}
        onClick={cancelAll}
      />
      <Button
        minimal
        icon="selection"
        title={
          selectAllState
            ? `全选${operatorsGroupedBySubProf.length}位干员`
            : undefined
        }
        disabled={!selectAllState}
        onClick={selectAll}
      />
      <Button
        minimal
        icon="symbol-triangle-up"
        disabled={!backToTop}
        title={backToTop ? '回到顶部' : undefined}
        onClick={resetPaginationState}
      />
    </div>
  )

  const ShowMoreButton = (
    <div className="flex items-center justify-center pt-3 cursor-default">
      {noMore ? (
        <>
          <H6>已经展示全部干员了({operatorsGroupedBySubProf.length})</H6>
          {canEclipse && (
            <H6
              className="ml-1 cursor-pointer text-sm text-gray-500 hover:text-inherit hover:underline"
              onClick={resetPaginationState}
            >
              收起
            </H6>
          )}
        </>
      ) : (
        <H6
          className="cursor-pointer mx-auto text-sm text-gray-500 hover:text-inherit hover:underline"
          onClick={() => setPageIndex(pageIndex + 1)}
        >
          显示更多干员(剩余{operatorsGroupedBySubProf.length - lastIndex})
        </H6>
      )}
    </div>
  )

  const ProfSelect = (
    <div className="flex flex-row-reverse h-screen sticky top-0 relative">
      <div
        className={clsx(
          'h-full flex flex-col mr-0.5',
          miniMedia ? 'w-6' : 'w-12',
        )}
      >
        {formattedProfessions.map((prof) => (
          <div
            key={prof.id}
            className="grow cursor-pointer relative flex justify-center items-center"
            title={prof.name}
            onClick={() => {
              setSelectedProf(prof)
              setSelectedSubProf(defaultSubProf[0])
            }}
            role="presentation"
          >
            {defaultProf.find(({ id }) => id === prof.id) ? (
              <H5 className={clsx(miniMedia && '!text-xs truncate')}>
                {prof.name}
              </H5>
            ) : (
              <img
                className="invert dark:invert-0"
                src={'/assets/prof-icons/' + prof.id + '.png'}
                alt={prof.name}
                title={prof.name}
              />
            )}
            {prof.id === selectedProf.id && (
              <div className="h-full w-1 bg-black dark:bg-white absolute top-0 right-full rounded" />
            )}
          </div>
        ))}
      </div>
      <Divider className="mr-0" />
      <div
        className={clsx(
          'mr-1 h-full flex flex-col justify-center items-end',
          miniMedia ? 'absolute right-full' : 'relative',
        )}
      >
        <div>
          {formattedSubProfessions?.map((subProf) => (
            <H4
              key={subProf.id}
              className={clsx(
                'truncate cursor-pointer my-3 opacity-50 hover:underline hover:opacity-90',
                subProf.id === selectedSubProf.id && '!opacity-100 underline',
              )}
              onClick={() => setSelectedSubProf(subProf)}
            >
              {subProf.name}
            </H4>
          ))}
        </div>
        {ActionList}
      </div>
    </div>
  )

  return (
    <div className="flex h-full">
      <div className="flex-auto px-1" ref={operatorScrollRef}>
        {operatorsGroupedBySubProf.length ? (
          <>
            <div
              key="operatorContainer"
              className="flex flex-wrap items-start content-start overscroll-contain relative"
            >
              {operatorsGroupedBySubProf
                .slice(0, lastIndex)
                .map(({ name: operatorInfoName }, index) => {
                  const operatorDetail = existedOperators.find(
                    ({ name }) => name === operatorInfoName,
                  )
                  return (
                    <div
                      className="flex items-center w-32 h-32 flex-0"
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
            {ShowMoreButton}
          </>
        ) : (
          OperatorNoData
        )}
      </div>
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
