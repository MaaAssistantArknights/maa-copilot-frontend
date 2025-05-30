import { FC, useCallback, useRef } from 'react'

import { OperatorNoData } from '../../../editor/operator/sheet/SheetNoneData'
import { ProfClassificationWithFilters } from '../../../editor/operator/sheet/sheetOperator/ProfClassificationWithFilters'
import { useOperatorFilterProvider } from '../../../editor/operator/sheet/sheetOperator/SheetOperatorFilterProvider'
import { SheetOperatorItem } from '../../../editor/operator/sheet/sheetOperator/SheetOperatorItem'
import { ShowMore } from '../../../editor/operator/sheet/sheetOperator/ShowMore'

interface SheetListProps {}

export const SheetList: FC<SheetListProps> = () => {
  const operatorScrollRef = useRef<HTMLDivElement>(null)

  const toTop = useCallback(
    () =>
      operatorScrollRef?.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      }),
    [operatorScrollRef],
  )

  const {
    operatorFiltered: { data: operatorFilteredData },
  } = useOperatorFilterProvider()

  return (
    <div className="flex h-full">
      <div className="grow px-1 py-4 overflow-auto">
        {operatorFilteredData.length ? (
          <>
            <div
              key="operatorContainer"
              className="flex flex-wrap items-start content-start overscroll-contain relative"
              ref={operatorScrollRef}
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
          <OperatorNoData />
        )}
      </div>
      <ProfClassificationWithFilters {...{ toTop }} />
    </div>
  )
}
