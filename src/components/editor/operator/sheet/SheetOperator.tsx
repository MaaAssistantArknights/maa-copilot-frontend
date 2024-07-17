import { FC, useCallback, useRef } from 'react'

import { SheetContainerSkeleton } from './SheetContainerSkeleton'
import { OperatorNoData } from './SheetNoneData'
import { ProfClassification } from './sheetOperator/ProfClassification'
import {
  OperatorFilterProvider,
  useOperatorFilterProvider,
} from './sheetOperator/SheetOperatorFilterProvider'
import { SheetOperatorItem } from './sheetOperator/SheetOperatorItem'
import { ShowMore } from './sheetOperator/ShowMore'
import { OperatorBackToTop } from './sheetOperator/toolBox/OperatorBackToTop'
import { OperatorMutipleSelect } from './sheetOperator/toolBox/OperatorMutipleSelect'

export interface SheetOperatorProps {}

// const defaultRarityFilter = Array.from(
//   new Array(Math.max(...OPERATORS.map(({ rarity }) => rarity)) + 1).keys(),
// ).slice(Math.min(...OPERATORS.map(({ rarity }) => rarity)))

const SheetOperator: FC<SheetOperatorProps> = () => {
  const operatorScrollRef = useRef<HTMLDivElement>(null)

  const toTop = useCallback(
    () => operatorScrollRef?.current?.scrollIntoView(),
    [operatorScrollRef],
  )

  // const getOperatorRarity = (target: string) =>
  //   operatorsGroupedByProf.find((item) => item.name === target)!.rarity

  const ToolBox = (
    <div className="flex pb-2 pr-2">
      {/* <Popover2
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
      </Popover2> */}
      <OperatorMutipleSelect />
      <OperatorBackToTop {...{ toTop }} />
    </div>
  )

  const {
    operatorFiltered: { data: operatorFilteredData },
  } = useOperatorFilterProvider()

  return (
    <div className="flex h-full">
      <div className="flex-auto px-1" ref={operatorScrollRef}>
        {operatorFilteredData.length ? (
          <>
            <div
              key="operatorContainer"
              className="flex flex-wrap items-start content-start overscroll-contain relative"
            >
              {operatorFilteredData.map(({ name }, index) => (
                <div className="flex items-center flex-0 w-32 h-32" key={index}>
                  <SheetOperatorItem {...{ name }} />
                </div>
              ))}
            </div>
            <ShowMore {...{ toTop }} />
          </>
        ) : (
          OperatorNoData
        )}
      </div>
      <div className="h-screen sticky top-0 sticky flex flex-col">
        <ProfClassification {...{ toTop }} />
        {ToolBox}
      </div>
    </div>
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
    <OperatorFilterProvider>
      <SheetOperator {...sheetOperatorProp} />
    </OperatorFilterProvider>
  </SheetContainerSkeleton>
)
