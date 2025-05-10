import { Button } from '@blueprintjs/core'

import { FC, Ref, useEffect, useMemo } from 'react'

import { useLevels } from '../../apis/level'
import { findLevelByStageName, hasHardMode } from '../../models/level'
import { OpDifficulty } from '../../models/operation'
import { DetailedSelect, DetailedSelectChoice } from '../editor/DetailedSelect'

interface DifficultyPickerProps {
  stageName?: string
  selectRef?: Ref<HTMLInputElement>
  value?: OpDifficulty
  onChange: (value: OpDifficulty, programmatically: boolean) => void
}

const DIFFICULTIES = [
  { type: 'choice', title: '默认', value: OpDifficulty.UNKNOWN },
  { type: 'choice', title: '普通', value: OpDifficulty.REGULAR },
  { type: 'choice', title: '突袭', value: OpDifficulty.HARD },
  { type: 'choice', title: '普通+突袭', value: OpDifficulty.REGULAR_HARD },
] satisfies DetailedSelectChoice[]

export const DifficultyPicker: FC<DifficultyPickerProps> = ({
  stageName,
  value,
  onChange,
}) => {
  const { data: levels } = useLevels()

  const isValidLevel = useMemo(() => {
    if (!stageName) {
      return false
    }
    // if the stageName is a custom level, we always allow setting difficulty
    if (!findLevelByStageName(levels, stageName)) {
      return true
    }
    return hasHardMode(levels, stageName)
  }, [levels, stageName])

  useEffect(() => {
    if (
      !isValidLevel &&
      value !== undefined &&
      value !== OpDifficulty.UNKNOWN
    ) {
      onChange(OpDifficulty.UNKNOWN, true)
    }
  }, [isValidLevel, value, onChange])

  return (
    <div className="flex items-baseline">
      <DetailedSelect
        disabled={!isValidLevel}
        items={DIFFICULTIES}
        value={value}
        onItemSelect={(item) => onChange(item.value as OpDifficulty, false)}
      >
        {
          <Button
            className="!border-gray-300 dark:!border-gray-600"
            rightIcon="double-caret-vertical"
            disabled={!isValidLevel}
          >
            {
              (
                DIFFICULTIES.find((item) => item.value === value) ??
                DIFFICULTIES[0]
              ).title
            }
          </Button>
        }
      </DetailedSelect>
      <span className="text-xs opacity-50">
        {!stageName
          ? '请选择关卡'
          : !isValidLevel
            ? '该关卡没有突袭难度，无需选择'
            : null}
      </span>
    </div>
  )
}
