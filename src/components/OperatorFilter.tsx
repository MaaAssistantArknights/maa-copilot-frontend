import { Checkbox } from '@blueprintjs/core'

import { useAtom } from 'jotai'
import { FC, useEffect } from 'react'

import {
  selectedOperatorsAtom,
  shouldSaveSelectedOperatorsAtom,
} from '../store/selectedOperators'
import { OperatorSelect } from './OperatorSelect'

interface OperatorSelectProps {
  className?: string
  operators: string[]
  onChange: (operators: string[]) => void
}

export const OperatorFilter: FC<OperatorSelectProps> = ({
  className,
  operators,
  onChange,
}) => {
  const [shouldSaveSelectedOperators, setShouldSaveSelectedOperators] = useAtom(
    shouldSaveSelectedOperatorsAtom,
  )
  const [savedSelectedOperators, setSavedSelectedOperators] = useAtom(
    selectedOperatorsAtom,
  )

  useEffect(() => {
    // 用户在另一个标签页中修改选择时，savedSelectedOperators 会同步到当前标签页，需要手动更新给 operators
    if (shouldSaveSelectedOperators) {
      onChange(savedSelectedOperators)
    }
  }, [shouldSaveSelectedOperators, savedSelectedOperators, onChange])

  const handleSelectOperator = (operators: string[]) => {
    onChange(operators)

    if (shouldSaveSelectedOperators) {
      setSavedSelectedOperators(operators)
    }
  }

  const handleShouldSaveSelectedOperators = (shouldSave: boolean) => {
    setShouldSaveSelectedOperators(shouldSave)

    if (shouldSave) {
      setSavedSelectedOperators(operators)
    }
  }

  return (
    <div className={className}>
      <OperatorSelect operators={operators} onChange={handleSelectOperator} />
      {operators.length > 0 && (
        <div className="flex justify-between items-baseline text-zinc-500">
          <div>点击干员标签以标记为排除该干员</div>
          <Checkbox
            className="[&>input:checked~.bp4-control-indicator]:bg-zinc-500"
            checked={shouldSaveSelectedOperators}
            onChange={(e) =>
              handleShouldSaveSelectedOperators(e.currentTarget.checked)
            }
          >
            <span className="-ml-2">记住选择</span>
          </Checkbox>
        </div>
      )}
    </div>
  )
}
