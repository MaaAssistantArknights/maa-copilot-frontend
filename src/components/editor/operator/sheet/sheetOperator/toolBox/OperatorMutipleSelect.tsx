import { Button } from '@blueprintjs/core'

import { FC, useMemo } from 'react'

import { useSheet } from '../../SheetProvider'
import { useOperatorFilterProvider } from '../SheetOperatorFilterProvider'

export interface OperatorMutipleSelectProp {}

export const OperatorMutipleSelect: FC<OperatorMutipleSelectProp> = () => {
  const {
    operatorFiltered: { data: operatorFilteredData },
  } = useOperatorFilterProvider()
  const { existedOperators, submitOperator, removeOperator } = useSheet()

  const { cancelAllDisabled, selectAllDisabled } = useMemo(() => {
    const existedOperatorsNames = existedOperators.map(({ name }) => name)
    return {
      cancelAllDisabled: !operatorFilteredData.some(({ name }) =>
        existedOperatorsNames.includes(name),
      ),
      selectAllDisabled: operatorFilteredData.every(({ name }) =>
        existedOperatorsNames.includes(name),
      ),
    }
  }, [existedOperators, operatorFilteredData])

  const selectAll = () =>
    operatorFilteredData.forEach((item) => {
      submitOperator(item, () => {})
    })

  const cancelAll = () => {
    const deleteIndexList: number[] = []
    operatorFilteredData.forEach(({ name }) => {
      const index = existedOperators.findIndex((item) => item.name === name)
      if (index !== -1) deleteIndexList.push(index)
    })
    removeOperator(deleteIndexList)
  }

  return (
    <>
      <Button
        minimal
        icon="circle"
        disabled={cancelAllDisabled}
        title={`取消选择全部${existedOperators.length}位干员`}
        onClick={cancelAll}
      />
      <Button
        minimal
        icon="selection"
        title={`全选${operatorFilteredData.length}位干员`}
        disabled={selectAllDisabled}
        onClick={selectAll}
      />
    </>
  )
}
