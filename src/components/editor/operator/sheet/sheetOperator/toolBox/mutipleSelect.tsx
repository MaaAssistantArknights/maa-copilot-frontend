import { Button } from '@blueprintjs/core'

import { FC, useMemo } from 'react'

import { useSheet } from '../../SheetProvider'
import { useOperatorFilterProvider } from '../SheetOperatorFilterProvider'

export interface MutipleSelectProp {}

export const MutipleSelect: FC<MutipleSelectProp> = () => {
  const {
    operatorFiltered: { data: operatorFilteredData },
  } = useOperatorFilterProvider()
  const { existedOperators } = useSheet()

  const { cancelAllDisabled, selectAllDisabled } = useMemo(() => {
    console.log('111')
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

  return (
    <div className="flex justify-center content-center">
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
    </div>
  )
}
