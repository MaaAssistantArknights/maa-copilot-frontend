import {
  Alert,
  Button,
  Card,
  Divider,
  H4,
  H5,
  H6,
  Icon,
  Intent,
} from '@blueprintjs/core'
import { Popover2 } from '@blueprintjs/popover2'
import { POPOVER2_DISMISS } from '@blueprintjs/popover2/lib/esm/classes'

import clsx from 'clsx'
import { useAtom } from 'jotai'
import { isEqual, omit } from 'lodash'
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { AppToaster } from 'components/Toaster'
import { CopilotDocV1 } from 'models/copilot.schema'
import { OPERATORS, PROFESSIONS } from 'models/operator'
import { ignoreKeyDic } from 'store/useFavGroups'
import { favOperatorAtom } from 'store/useFavOperators'

import { OperatorAvatar } from '../EditorOperator'
import { Group, Operator } from '../EditorSheet'
import { SheetContainerSkeleton } from './SheetContainerSkeleton'
import { OperatorNoData } from './SheetNoneData'
import { OperatorItem } from './SheetOperatorItem'
import { SkillAboutProps, SkillAboutTrigger } from './SheetOperatorSkillAbout'
import { useSheet } from './SheetProvider'

export interface SheetOperatorProps {}

export interface OperatorModifyProps {
  operatorPinHandle?: (value: Operator) => void
  operatorSelectHandle?: (value: string) => void
  // operatorSkillHandle?: (value: Operator) => void
}

const defaultProf = [
  {
    id: 'all',
    name: '全部',
    sub: [],
  },
  {
    id: 'fav',
    name: '收藏',
    sub: [],
  },
  {
    id: 'others',
    name: '其它',
    sub: [],
  },
]

const defaultSubProf = [
  { id: 'all', name: '全部' },
  { id: 'selected', name: '已选择' },
]

const formattedProfessions = [
  ...defaultProf.slice(0, defaultProf.length - 1),
  ...PROFESSIONS,
  ...defaultProf.slice(defaultProf.length - 1),
]

const paginationSize = 60
const defaultRarityFilter = Array.from(
  new Array(Math.max(...OPERATORS.map(({ rarity }) => rarity)) + 1).keys(),
).slice(Math.min(...OPERATORS.map(({ rarity }) => rarity)))

const SheetOperator: FC<SheetOperatorProps> = () => {
  const { submitOperator, existedOperators, removeOperator, existedGroups } =
    useSheet()
  const operatorScrollRef = useRef<HTMLDivElement>(null)

  const [selectedProf, setSelectedProf] = useState(formattedProfessions[0])
  const [selectedSubProf, setSelectedSubProf] = useState(defaultSubProf[0])
  const [operatorRarity, setOperatorRarity] = useState(defaultRarityFilter)
  const [rarityReverse, setRarityReverse] = useState(false)
  const [favOperators, setFavOperators] = useAtom(favOperatorAtom)
  const [coverOperator, setCoverOperator] = useState<Operator>()

  const favOperatorFindByName = (target: string) => {
    return !!favOperators.find(({ name }) => name === target)
  }

  const [formattedSubProfessions, operatorsGroupedByProf] = useMemo(
    () => [
      // handle customize operators
      [...defaultSubProf, ...(selectedProf.sub || [])],
      [
        ...existedOperators
          .filter((item) => !OPERATORS.find(({ name }) => name === item.name))
          .map(({ name }) => {
            return {
              name,
              subProf: '',
              rarity: 0,
            }
          }),
        ...OPERATORS,
      ].filter((item) => {
        if (selectedProf.id === defaultProf[0].id) return true
        if (selectedProf.id === defaultProf[1].id)
          return favOperatorFindByName(item.name)
        else if (selectedProf.id === defaultProf[2].id) {
          return item.subProf === 'notchar1' || !item.subProf
        } else return !!selectedProf.sub?.find((op) => op.id === item.subProf)
      }),
    ],
    [selectedProf, existedOperators, favOperators],
  )

  const checkOperatorSelected = useCallback(
    (target: string) => {
      if (existedOperators.find((item) => item.name === target)) return true
      else
        return !!existedGroups
          .map((item) => item.opers)
          .flat()
          .find((item) => item?.name === target)
    },
    [existedOperators, existedGroups],
  )

  const checkOperatorPinned = (target: Operator, ignoreKey = ignoreKeyDic) =>
    isEqual(
      omit(target, [...ignoreKey]),
      omit(
        favOperators.find(({ name }) => name === target.name),
        [...ignoreKey],
      ),
    )

  const updateFavOperator = (value: Operator) => {
    const { skill, skillUsage, skillTimes, ...rest } = value
    const formattedValue = {
      ...rest,
      skill: skill || 1,
      skillUsage: skillUsage || 0,
      skillTimes:
        skillUsage === CopilotDocV1.SkillUsageType.ReadyToUseTimes
          ? skillTimes || 1
          : undefined,
    }
    setFavOperators([
      ...[...favOperators].filter(({ name }) => name !== formattedValue.name),
      { ...formattedValue },
    ])
    submitOperator(formattedValue, undefined, true)
  }

  const operatorPinHandle: OperatorModifyProps['operatorPinHandle'] = (
    value,
  ) => {
    if (checkOperatorPinned(value))
      setFavOperators(
        [...favOperators].filter(({ name }) => name !== value.name),
      )
    else {
      if (favOperatorFindByName(value.name)) setCoverOperator(value)
      else updateFavOperator(value)
    }
  }

  const getOperatorRarity = (target: string) =>
    operatorsGroupedByProf.find((item) => item.name === target)!.rarity

  const operatorsGroupedBySubProf = useMemo(() => {
    let result: Operator[] = []
    if (selectedSubProf.id === 'all') result = operatorsGroupedByProf
    else if (selectedSubProf.id === 'selected')
      result = operatorsGroupedByProf.filter((item) =>
        checkOperatorSelected(item.name),
      )
    else
      result = operatorsGroupedByProf.filter(
        (item) => item.subProf === selectedSubProf.id,
      )

    result = result
      .filter(({ name }) => {
        return (
          operatorRarity.findIndex(
            (rarity) => getOperatorRarity(name) === rarity,
          ) !== -1
        )
      })
      .sort(
        ({ name: aName }, { name: bName }) =>
          getOperatorRarity(bName) - getOperatorRarity(aName),
      )

    return rarityReverse ? result.reverse() : result
  }, [
    selectedSubProf,
    operatorsGroupedByProf,
    checkOperatorSelected,
    operatorRarity,
    rarityReverse,
    getOperatorRarity,
  ])

  const operatorSelectHandle: OperatorModifyProps['operatorSelectHandle'] = (
    operatorName,
  ) => {
    if (checkOperatorSelected(operatorName))
      if (existedOperators.find((item) => item.name === operatorName))
        removeOperator(
          existedOperators.findIndex(({ name }) => name === operatorName),
        )
      else
        AppToaster.show({
          message: `干员 ${operatorName} 已被编组`,
          intent: Intent.DANGER,
        })
    else
      submitOperator(
        favOperators.find(({ name }) => name === operatorName) || {
          name: operatorName,
        },
        undefined,
        true,
      )
  }

  const operatorSkillHandle = (value) => {
    submitOperator(value, undefined, true)
  }

  // pagination about via frontened
  const [pageIndex, setPageIndex] = useState(0)
  const lastIndex = (pageIndex + 1) * paginationSize
  const backToTop = lastIndex > paginationSize

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

  const ActionList = (
    <div className="absolute bottom-0">
      <Popover2
        content={
          <RaritySelector
            {...{
              operatorRarity,
              setOperatorRarity,
              rarityReverse,
              setRarityReverse,
            }}
          />
        }
      >
        <Button minimal icon="filter-list" />
      </Popover2>
      <Button
        minimal
        icon="circle"
        disabled={
          !operatorsGroupedBySubProf.some(({ name }) =>
            checkOperatorSelected(name),
          )
        }
        title={`取消选择全部${existedOperators.length}位干员`}
        onClick={cancelAll}
      />
      <Button
        minimal
        icon="selection"
        title={`全选${operatorsGroupedBySubProf.length}位干员`}
        disabled={operatorsGroupedBySubProf.every(({ name }) =>
          checkOperatorSelected(name),
        )}
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
      {lastIndex >= operatorsGroupedBySubProf.length ? (
        <>
          <H6>已经展示全部干员了({operatorsGroupedBySubProf.length})</H6>
          {operatorsGroupedBySubProf.length > paginationSize && (
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
      <div className="h-full flex flex-col mr-0.5 w-6 sm:w-12">
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
              <H5 className="!text-xs sm:!text-base truncate">{prof.name}</H5>
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
      <div className="mr-1 h-full flex flex-col justify-center items-end absolute right-full sm:relative sm:left-0">
        <div>
          {formattedSubProfessions?.map((subProf) => (
            <H4
              key={subProf.id}
              className={clsx(
                'truncate cursor-pointer my-3 opacity-50 hover:underline hover:opacity-90',
                subProf.id === selectedSubProf.id && '!opacity-100 underline',
                subProf.name.length > 3 && '!text-base',
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
    <>
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
                        className="flex items-center flex-0 w-32 h-32"
                        key={index}
                      >
                        {/* <OperatorItem
                          selected={checkOperatorSelected(operatorInfoName)}
                          pinned={checkOperatorPinned(
                            operatorDetail || { name: operatorInfoName },
                          )}
                          onSkillChange={operatorSkillHandle}
                          operator={operatorDetail}
                          name={operatorInfoName}
                          onClick={() => operatorSelectHandle(operatorInfoName)}
                          onPinHandle={
                            existedOperators.find(
                              ({ name }) => name === operatorInfoName,
                            )
                              ? operatorPinHandle
                              : undefined
                          }
                        /> */}
                        {/* <SheetOperatorItem name={operatorInfoName} /> */}
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
      <Alert
        isOpen={!!coverOperator}
        confirmButtonText="是"
        cancelButtonText="否"
        icon="error"
        intent={Intent.DANGER}
        onConfirm={() => updateFavOperator(coverOperator as Group)}
        onClose={() => setCoverOperator(undefined)}
      >
        <div>
          <H5>收藏: </H5>
          <p>检测到同名的已收藏干员 {coverOperator?.name}，是否覆盖？</p>
        </div>
      </Alert>
    </>
  )
}

const RaritySelector = ({
  operatorRarity,
  setOperatorRarity,
  rarityReverse,
  setRarityReverse,
}: {
  operatorRarity: number[]
  setOperatorRarity: (target: number[]) => void
  rarityReverse: boolean
  setRarityReverse: (target: boolean) => void
}) => {
  const selectClass = 'scale-90'
  const [rarity, setRarity] = useState<number[]>(operatorRarity)
  const [reverse, setReverse] = useState<boolean>(rarityReverse)

  const resetFilter = () => {
    setRarity(defaultRarityFilter)
    setReverse(false)
  }
  const submitFilter = () => {
    setOperatorRarity(rarity)
    setRarityReverse(reverse)
  }

  return (
    <div>
      <div className="flex items-center">
        <H5 className="m-0 mr-1">按干员稀有度展示</H5>
        <Button icon="reset" minimal title="重置选择" onClick={resetFilter} />
      </div>
      <div className="flex my-1">
        {Array(7)
          .fill(0)
          .map((_, index) => {
            const isSelect = rarity.findIndex((item) => item === index) !== -1
            return (
              <Button
                key={index}
                active={isSelect}
                text={index}
                minimal
                className={clsx(isSelect && selectClass)}
                onClick={() =>
                  isSelect
                    ? setRarity([...rarity].filter((item) => item !== index))
                    : setRarity([...rarity, index])
                }
              />
            )
          })}
      </div>
      <div className="flex">
        <Button
          minimal
          icon="arrow-up"
          className={clsx(!reverse && selectClass)}
          active={!reverse}
          onClick={() => setReverse(false)}
          title="按从下至上升序排列"
        />
        <Button
          minimal
          icon="arrow-down"
          className={clsx(reverse && selectClass)}
          active={reverse}
          onClick={() => setReverse(true)}
          title="按从下至上降序排列"
        />
      </div>
      <Divider />
      <Button text="确认" className={POPOVER2_DISMISS} onClick={submitFilter} />
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

interface SheetOperatorItemProp {
  name: string
}

const SheetOperatorItem: FC<SheetOperatorItemProp> = ({ name }) => {
  const { existedOperators, existedGroups, submitOperator, removeOperator } =
    useSheet()
  const operatorNoneGroupedIndex = existedOperators.findIndex(
    ({ name: existedName }) => existedName === name,
  )
  const operatorInGroup = existedGroups
    .map(({ opers }) => opers)
    .flat()
    .filter((item) => !!item)
    .find(({ name: existedName }) => existedName === name)
  const selected = operatorNoneGroupedIndex !== -1
  const grouped = !!operatorInGroup
  const operator = existedOperators?.[operatorNoneGroupedIndex] ||
    operatorInGroup || { name }
  const selectedInView = selected || grouped

  const [favOperators, setFavOperators] = useAtom(favOperatorAtom)
  const pinned = isEqual(
    omit(operator, [...ignoreKeyDic]),
    omit(
      favOperators.find(({ name: exsitedName }) => exsitedName === name),
      [...ignoreKeyDic],
    ),
  )

  const onOperatorSelect = () => {
    if (grouped)
      AppToaster.show({
        message: `干员 ${name} 已被编组`,
        intent: Intent.DANGER,
      })
    else {
      if (selected) {
        removeOperator(operatorNoneGroupedIndex)
      } else submitOperator(operator, undefined, true)
    }
  }

  const onPinHandle = () => {
    existedOperators.find(({ name }) => name === operatorInfoName)
      ? operatorPinHandle
      : undefined
  }

  const operatorPinHandle: OperatorModifyProps['operatorPinHandle'] = (
    value,
  ) => {
    if (pinned)
      setFavOperators(
        [...favOperators].filter(
          ({ name: existedName }) => existedName !== name,
        ),
      )
    else {
      if (favOperatorFindByName(value.name)) setCoverOperator(value)
      else updateFavOperator(value)
    }
  }

  return (
    <Card
      className={clsx(
        'flex items-center w-full h-full relative cursor-pointer flex-col justify-center',
        (selected || grouped) && 'scale-90 bg-gray-200',
      )}
      interactive={!selectedInView}
      onClick={onOperatorSelect}
    >
      <>
        <>
          <OperatorAvatar name={name} size="large" />
          <p
            className={clsx('font-bold leading-none text-center mt-3 truncate')}
          >
            {name}
          </p>
        </>
        {/* {(selected || grouped) && (
          <div
            className="absolute top-2 right-2"
            onClick={(e) => e.stopPropagation()}
            role="presentation"
          >
            <Popover2
              content={
                <Button
                  minimal
                  onClick={() => onPinHandle?.(operator as Operator)}
                >
                  <Icon icon="pin" className="-rotate-45" />
                  <span>移出收藏</span>
                </Button>
              }
              disabled={!pinned}
            >
              <Icon
                icon={pinned ? 'pin' : 'unpin'}
                className={clsx(pinned && '-rotate-45')}
                onClick={
                  pinned ? undefined : () => onPinHandle?.(operator as Operator)
                }
              />
            </Popover2>
          </div>
        )} */}
      </>
      {selected && (
        <SkillAboutTrigger
          {...{
            operator,
            onSkillChange: (value) => submitOperator(value, undefined, true),
            disabled: grouped,
          }}
        />
      )}
      {grouped && (
        <span className="text-xs font-bold mt-3">
          <Icon icon="warning-sign" size={15} />
          已被编组
        </span>
      )}
    </Card>
  )
}
