import { Button, Divider, H4, H5, H6 } from '@blueprintjs/core'
import { Popover2 } from '@blueprintjs/popover2'
import { POPOVER2_DISMISS } from '@blueprintjs/popover2/lib/esm/classes'

import clsx from 'clsx'
import { useAtomValue } from 'jotai'
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { OPERATORS, PROFESSIONS } from 'models/operator'
import { favOperatorAtom } from 'store/useFavOperators'

import { Operator } from '../EditorSheet'
import { SheetContainerSkeleton } from './SheetContainerSkeleton'
import { OperatorNoData } from './SheetNoneData'
import { useSheet } from './SheetProvider'
import {
  DEFAULTPROFID,
  DEFAULTSUBPROFID,
  useOperatorAfterFiltered,
} from './sheetOperator/OperatorFilter'
import {
  ProfClassification,
  ProfClassificationProp,
} from './sheetOperator/ProfClassification'
import { SheetOperatorItem } from './sheetOperator/SheetOperatorItem'

export interface SheetOperatorProps {}

export interface OperatorModifyProps {
  operatorPinHandle?: (value: Operator) => void
  operatorSelectHandle?: (value: string) => void
  // operatorSkillHandle?: (value: Operator) => void
}

// const defaultProf = [
//   {
//     id: 'all',
//     name: '全部',
//     sub: [],
//   },
//   {
//     id: 'fav',
//     name: '收藏',
//     sub: [],
//   },
//   {
//     id: 'others',
//     name: '其它',
//     sub: [],
//   },
// ]

// const defaultSubProf = [
//   { id: 'allSubProf', name: '全部' },
//   { id: 'selected', name: '已选择' },
// ]

// const formattedProfessions = [
//   ...defaultProf.slice(0, defaultProf.length - 1),
//   ...PROFESSIONS,
//   ...defaultProf.slice(defaultProf.length - 1),
// ]

const paginationSize = 60
// const defaultRarityFilter = Array.from(
//   new Array(Math.max(...OPERATORS.map(({ rarity }) => rarity)) + 1).keys(),
// ).slice(Math.min(...OPERATORS.map(({ rarity }) => rarity)))

const SheetOperator: FC<SheetOperatorProps> = () => {
  // const { submitOperator, existedOperators, removeOperator, existedGroups } =
  //   useSheet()
  const operatorScrollRef = useRef<HTMLDivElement>(null)

  const [activeProf, setActiveProf] = useState<
    ProfClassificationProp['activeProf']
  >([DEFAULTPROFID.ALL, DEFAULTSUBPROFID.ALL])

  // const [selectedProf, setSelectedProf] = useState(formattedProfessions[0])
  // const [selectedSubProf, setSelectedSubProf] = useState(defaultSubProf[0])
  // const [operatorRarity, setOperatorRarity] = useState(defaultRarityFilter)
  const [rarityReverse, setRarityReverse] = useState(false)
  // const favOperators = useAtomValue(favOperatorAtom)

  // const [formattedSubProfessions, operatorsGroupedByProf] = useMemo(
  //   () => [
  //     // handle customize operators
  //     [...defaultSubProf, ...(selectedProf.sub || [])],
  //     [
  //       ...existedOperators
  //         .filter((item) => !OPERATORS.find(({ name }) => name === item.name))
  //         .map(({ name }) => {
  //           return {
  //             name,
  //             subProf: '',
  //             rarity: 0,
  //           }
  //         }),
  //       ...OPERATORS,
  //     ].filter((item) => {
  //       if (selectedProf.id === defaultProf[0].id) return true
  //       if (selectedProf.id === defaultProf[1].id)
  //         return !!favOperators.find(({ name }) => name === item.name)
  //       else if (selectedProf.id === defaultProf[2].id) {
  //         return item.subProf === 'notchar1' || !item.subProf
  //       } else return !!selectedProf.sub?.find((op) => op.id === item.subProf)
  //     }),
  //   ],
  //   [selectedProf.sub, selectedProf.id, existedOperators, favOperators],
  // )

  // const checkOperatorSelected = useCallback(
  //   (target: string) => {
  //     if (existedOperators.find((item) => item.name === target)) return true
  //     else
  //       return !!existedGroups
  //         .map((item) => item.opers)
  //         .flat()
  //         .find((item) => item?.name === target)
  //   },
  //   [existedOperators, existedGroups],
  // )

  // const getOperatorRarity = (target: string) =>
  //   operatorsGroupedByProf.find((item) => item.name === target)!.rarity

  // const operatorsGroupedBySubProf = useMemo(() => {
  //   let result: Operator[] = []
  //   if (selectedSubProf.id === 'all') result = operatorsGroupedByProf
  //   else if (selectedSubProf.id === 'selected')
  //     result = operatorsGroupedByProf.filter((item) =>
  //       checkOperatorSelected(item.name),
  //     )
  //   else
  //     result = operatorsGroupedByProf.filter(
  //       (item) => item.subProf === selectedSubProf.id,
  //     )

  //   result = result
  //     .filter(({ name }) => {
  //       return (
  //         operatorRarity.findIndex(
  //           (rarity) => getOperatorRarity(name) === rarity,
  //         ) !== -1
  //       )
  //     })
  //     .sort(
  //       ({ name: aName }, { name: bName }) =>
  //         getOperatorRarity(bName) - getOperatorRarity(aName),
  //     )

  //   return rarityReverse ? result.reverse() : result
  // }, [
  //   selectedSubProf,
  //   operatorsGroupedByProf,
  //   checkOperatorSelected,
  //   operatorRarity,
  //   rarityReverse,
  //   getOperatorRarity,
  // ])

  // pagination about via frontened
  const [pageIndex, setPageIndex] = useState(0)
  const lastIndex = (pageIndex + 1) * paginationSize
  const backToTop = lastIndex > paginationSize

  const resetPaginationState = () => {
    setPageIndex(0)
    operatorScrollRef?.current?.scrollIntoView()
  }

  // useEffect(resetPaginationState, [selectedProf, selectedSubProf])

  // const selectAll = () => {
  //   operatorsGroupedBySubProf.forEach((item) => {
  //     submitOperator(item, () => {})
  //   })
  // }

  // const cancelAll = () => {
  //   const deleteIndexList: number[] = []
  //   operatorsGroupedBySubProf.forEach(({ name }) => {
  //     const index = existedOperators.findIndex((item) => item.name === name)
  //     if (index !== -1) deleteIndexList.push(index)
  //   })
  //   removeOperator(deleteIndexList)
  // }

  // const ActionList = (
  //   <div className="absolute bottom-0">
  //     <Popover2
  //       content={
  //         <RaritySelector
  //           {...{
  //             operatorRarity,
  //             setOperatorRarity,
  //             rarityReverse,
  //             setRarityReverse,
  //           }}
  //         />
  //       }
  //     >
  //       <Button minimal icon="filter-list" />
  //     </Popover2>
  //     <Button
  //       minimal
  //       icon="circle"
  //       disabled={
  //         !operatorsGroupedBySubProf.some(({ name }) =>
  //           checkOperatorSelected(name),
  //         )
  //       }
  //       title={`取消选择全部${existedOperators.length}位干员`}
  //       onClick={cancelAll}
  //     />
  //     <Button
  //       minimal
  //       icon="selection"
  //       title={`全选${operatorsGroupedBySubProf.length}位干员`}
  //       disabled={operatorsGroupedBySubProf.every(({ name }) =>
  //         checkOperatorSelected(name),
  //       )}
  //       onClick={selectAll}
  //     />
  //     <Button
  //       minimal
  //       icon="symbol-triangle-up"
  //       disabled={!backToTop}
  //       title={backToTop ? '回到顶部' : undefined}
  //       onClick={resetPaginationState}
  //     />
  //   </div>
  // )

  // console.log(selectedProf, selectedSubProf)

  // const ShowMoreButton = (
  //   <div className="flex items-center justify-center pt-3 cursor-default">
  //     {lastIndex >= operatorsGroupedBySubProf.length ? (
  //       <>
  //         <H6>已经展示全部干员了({operatorsGroupedBySubProf.length})</H6>
  //         {operatorsGroupedBySubProf.length > paginationSize && (
  //           <H6
  //             className="ml-1 cursor-pointer text-sm text-gray-500 hover:text-inherit hover:underline"
  //             onClick={resetPaginationState}
  //           >
  //             收起
  //           </H6>
  //         )}
  //       </>
  //     ) : (
  //       <H6
  //         className="cursor-pointer mx-auto text-sm text-gray-500 hover:text-inherit hover:underline"
  //         onClick={() => setPageIndex(pageIndex + 1)}
  //       >
  //         显示更多干员(剩余{operatorsGroupedBySubProf.length - lastIndex})
  //       </H6>
  //     )}
  //   </div>
  // )

  // const ProfSelect = (
  //   <div className="flex flex-row-reverse h-screen sticky top-0 relative">
  //     <div className="h-full flex flex-col mr-0.5 w-6 sm:w-12">
  //       {formattedProfessions.map((prof) => (
  //         <div
  //           key={prof.id}
  //           className="grow cursor-pointer relative flex justify-center items-center"
  //           title={prof.name}
  //           onClick={() => {
  //             setSelectedProf(prof)
  //             setSelectedSubProf(defaultSubProf[0])
  //           }}
  //           role="presentation"
  //         >
  //           <img
  //             className="invert dark:invert-0"
  //             src={'/assets/prof-icons/' + prof.id + '.png'}
  //             alt=""
  //             onError={() => (
  //               <H5 className="!text-xs sm:!text-base truncate">{prof.name}</H5>
  //             )}
  //             title={prof.name}
  //           />
  //           {prof.id === selectedProf.id && (
  //             <div className="h-full w-1 bg-black dark:bg-white absolute top-0 right-full rounded" />
  //           )}
  //         </div>
  //       ))}
  //     </div>
  //     <Divider className="mr-0" />
  //     <div className="mr-1 h-full flex flex-col justify-center items-end absolute right-full sm:relative sm:left-0">
  //       <div>
  //         {formattedSubProfessions?.map((subProf) => (
  //           <H4
  //             key={subProf.id}
  //             className={clsx(
  //               'truncate cursor-pointer my-3 opacity-50 hover:underline hover:opacity-90',
  //               subProf.id === selectedSubProf.id && '!opacity-100 underline',
  //               subProf.name.length > 3 && '!text-base',
  //             )}
  //             onClick={() => setSelectedSubProf(subProf)}
  //           >
  //             {subProf.name}
  //           </H4>
  //         ))}
  //       </div>
  //       {ActionList}
  //     </div>
  //   </div>
  // )

  const operatorsAfterFiltered = useOperatorAfterFiltered({
    selectedProf: activeProf,
  })

  console.log(operatorsAfterFiltered)

  return (
    <>
      <div className="flex h-full">
        <div className="flex-auto px-1" ref={operatorScrollRef}>
          {operatorsAfterFiltered.length ? (
            <>
              <div
                key="operatorContainer"
                className="flex flex-wrap items-start content-start overscroll-contain relative"
              >
                {operatorsAfterFiltered
                  .slice(0, lastIndex)
                  .map(({ name }, index) => (
                    <div
                      className="flex items-center flex-0 w-32 h-32"
                      key={index}
                    >
                      <SheetOperatorItem {...{ name }} />
                    </div>
                  ))}
              </div>
              {/* {ShowMoreButton} */}
            </>
          ) : (
            OperatorNoData
          )}
        </div>
        {/* {ProfSelect} */}
        <ProfClassification {...{ activeProf, setActiveProf }} />
      </div>
    </>
  )
}

// const RaritySelector = ({
//   operatorRarity,
//   setOperatorRarity,
//   rarityReverse,
//   setRarityReverse,
// }: {
//   operatorRarity: number[]
//   setOperatorRarity: (target: number[]) => void
//   rarityReverse: boolean
//   setRarityReverse: (target: boolean) => void
// }) => {
//   const selectClass = 'scale-90'
//   const [rarity, setRarity] = useState<number[]>(operatorRarity)
//   const [reverse, setReverse] = useState<boolean>(rarityReverse)

//   const resetFilter = () => {
//     setRarity(defaultRarityFilter)
//     setReverse(false)
//   }
//   const submitFilter = () => {
//     setOperatorRarity(rarity)
//     setRarityReverse(reverse)
//   }

//   return (
//     <div>
//       <div className="flex items-center">
//         <H5 className="m-0 mr-1">按干员稀有度展示</H5>
//         <Button icon="reset" minimal title="重置选择" onClick={resetFilter} />
//       </div>
//       <div className="flex my-1">
//         {Array(7)
//           .fill(0)
//           .map((_, index) => {
//             const isSelect = rarity.findIndex((item) => item === index) !== -1
//             return (
//               <Button
//                 key={index}
//                 active={isSelect}
//                 text={index}
//                 minimal
//                 className={clsx(isSelect && selectClass)}
//                 onClick={() =>
//                   isSelect
//                     ? setRarity([...rarity].filter((item) => item !== index))
//                     : setRarity([...rarity, index])
//                 }
//               />
//             )
//           })}
//       </div>
//       <div className="flex">
//         <Button
//           minimal
//           icon="arrow-up"
//           className={clsx(!reverse && selectClass)}
//           active={!reverse}
//           onClick={() => setReverse(false)}
//           title="按从下至上升序排列"
//         />
//         <Button
//           minimal
//           icon="arrow-down"
//           className={clsx(reverse && selectClass)}
//           active={reverse}
//           onClick={() => setReverse(true)}
//           title="按从下至上降序排列"
//         />
//       </div>
//       <Divider />
//       <Button text="确认" className={POPOVER2_DISMISS} onClick={submitFilter} />
//     </div>
//   )
// }

export const SheetOperatorContainer = (
  sheetOperatorProp: SheetOperatorProps,
) => (
  <SheetContainerSkeleton title="选择干员" icon="person">
    <SheetOperator {...sheetOperatorProp} />
  </SheetContainerSkeleton>
)
