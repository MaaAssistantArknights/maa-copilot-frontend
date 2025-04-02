import { Button, Classes, MenuDivider, MenuItem } from '@blueprintjs/core'

import clsx from 'clsx'
import Fuse from 'fuse.js'
import { FC, useMemo } from 'react'

import { useLevels } from '../apis/level'
import { createCustomLevel, isHardMode } from '../models/level'
import { Level } from '../models/operation'
import { useDebouncedQuery } from '../utils/useDebouncedQuery'
import { Select } from './Select'

interface LevelSelectProps {
  className?: string
  value: string
  onChange: (level: string) => void
}

export const LevelSelect: FC<LevelSelectProps> = ({
  className,
  value,
  onChange,
}) => {
  const { data } = useLevels()
  const levels = useMemo(
    () =>
      data
        // to simplify the list, we only show levels in normal mode
        .filter((level) => !isHardMode(level.stageId))
        .sort((a, b) => a.levelId.localeCompare(b.levelId)),
    [data],
  )
  const fuse = useMemo(
    () =>
      new Fuse(levels, {
        keys: ['name', 'catTwo', 'catThree', 'stageId'],
        threshold: 0.3,
      }),
    [levels],
  )

  const { query, debouncedQuery, updateQuery, onOptionMouseDown } =
    useDebouncedQuery()

  const selectedLevel = useMemo(() => {
    const level = levels.find((el) => el.stageId === value)
    if (level) {
      return level
    }
    // 如果有 value 但匹配不到，就创建一个自定义关卡来显示
    if (value) {
      return createCustomLevel(value)
    }
    return undefined
  }, [levels, value])

  const filteredLevels = useMemo(() => {
    // 未输入 query 时显示同类关卡
    if (selectedLevel && !debouncedQuery) {
      let similarLevels: Level[]
      let headerName: string

      if (selectedLevel.catOne === '剿灭作战') {
        headerName = selectedLevel.catOne
        similarLevels = levels.filter(
          (el) => el.catOne === selectedLevel.catOne,
        )
      } else if (
        selectedLevel.stageId.includes('rune') ||
        selectedLevel.stageId.includes('crisis')
      ) {
        // 危机合约分类非常混乱，直接全塞到一起
        headerName = '危机合约'
        similarLevels = levels.filter(
          (el) => el.stageId.includes('rune') || el.stageId.includes('crisis'),
        )
      } else if (selectedLevel.catTwo) {
        headerName = selectedLevel.catTwo
        similarLevels = levels.filter(
          (el) => el.catTwo === selectedLevel.catTwo,
        )
      } else {
        // catTwo 为空的时候用 levelId 来分类
        headerName = '相关关卡'
        const levelIdPrefix = selectedLevel.levelId
          .split('/')
          .slice(0, -1)
          .join('/')
        similarLevels = levelIdPrefix
          ? levels.filter((el) => el.levelId.startsWith(levelIdPrefix))
          : []
      }

      if (similarLevels.length > 1) {
        const header = createCustomLevel('header')
        header.name = headerName
        return [header, ...similarLevels]
      }
    }

    return debouncedQuery.trim()
      ? fuse.search(debouncedQuery).map((el) => el.item)
      : levels
  }, [debouncedQuery, selectedLevel, levels, fuse])

  return (
    <Select<Level>
      items={levels}
      itemListPredicate={() => filteredLevels}
      query={query}
      onQueryChange={(query) => updateQuery(query, false)}
      onReset={() => onChange('')}
      className={clsx('items-stretch', className)}
      itemsEqual={(a, b) => a.stageId === b.stageId}
      itemDisabled={(item) => item.stageId === 'header'} // 避免 header 被选中为 active
      itemRenderer={(item, { handleClick, handleFocus, modifiers }) =>
        item.stageId === 'header' ? (
          <MenuDivider key="header" title={item.name} />
        ) : (
          <MenuItem
            roleStructure="listoption"
            key={item.stageId}
            className={clsx(modifiers.active && Classes.ACTIVE)}
            text={`${item.catThree} ${item.name}`}
            onClick={handleClick}
            onFocus={handleFocus}
            onMouseDown={onOptionMouseDown}
            selected={item === selectedLevel}
            disabled={modifiers.disabled}
          />
        )
      }
      selectedItem={selectedLevel}
      onItemSelect={(level) => {
        // 重置 query 以显示同类关卡
        updateQuery('', true)
        onChange(level.stageId)
      }}
      createNewItemFromQuery={(query) => createCustomLevel(query)}
      createNewItemRenderer={(query, active, handleClick) => (
        <MenuItem
          key="create-new-item"
          roleStructure="listoption"
          text={`使用自定义关卡名 "${query}"`}
          icon="text-highlight"
          onClick={handleClick}
          active={active}
        />
      )}
      inputProps={{
        placeholder: '关卡名、类型、编号',
      }}
      popoverProps={{
        minimal: true,
      }}
    >
      {
        <Button
          minimal
          className="!pl-3 !pr-2"
          icon="area-of-interest"
          rightIcon="chevron-down"
        >
          {selectedLevel ? selectedLevel.catThree : '关卡'}
        </Button>
      }
    </Select>
  )
}
