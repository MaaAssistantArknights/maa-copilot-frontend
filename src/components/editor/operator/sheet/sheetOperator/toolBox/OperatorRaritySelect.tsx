import { Button, Divider, H5 } from '@blueprintjs/core'

import clsx from 'clsx'
import { FC } from 'react'

import {
  defaultRarityFilter,
  useOperatorFilterProvider,
} from '../SheetOperatorFilterProvider'

export interface OperatorRaritySelectProp {}

export const OperatorRaritySelect: FC<OperatorRaritySelectProp> = () => {
  const {
    useRarityFilterState: [{ selectedRarity, reverse }, setRarityFilter],
  } = useOperatorFilterProvider()

  const selectClass = 'scale-90'

  return (
    <>
      <div className="flex items-center">
        <H5 className="m-0 mr-1">按干员稀有度展示</H5>
        <Button
          icon="reset"
          minimal
          title="重置选择"
          onClick={() => setRarityFilter(defaultRarityFilter)}
        />
      </div>
      <div className="flex my-1">
        {defaultRarityFilter.selectedRarity.map((rarityIndex) => {
          const isSelect = selectedRarity.includes(rarityIndex)
          return (
            <Button
              key={rarityIndex}
              active={isSelect}
              text={rarityIndex}
              minimal
              className={clsx(isSelect && selectClass)}
              onClick={() =>
                setRarityFilter(({ selectedRarity, ...rest }) => ({
                  ...rest,
                  selectedRarity: isSelect
                    ? selectedRarity.filter(
                        (selectedRarityIndex) =>
                          selectedRarityIndex !== rarityIndex,
                      )
                    : [...selectedRarity, rarityIndex],
                }))
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
          onClick={() =>
            setRarityFilter((prev) => ({
              ...prev,
              reverse: false,
            }))
          }
          title="按从下至上升序排列"
        />
        <Button
          minimal
          icon="arrow-down"
          className={clsx(reverse && selectClass)}
          active={reverse}
          onClick={() =>
            setRarityFilter((prev) => ({
              ...prev,
              reverse: true,
            }))
          }
          title="按从下至上降序排列"
        />
      </div>
      <Divider />
      {/* <Button text="确认" className={POPOVER2_DISMISS} onClick={submitFilter} /> */}
    </>
  )
}
