import { MenuDivider, MenuItem } from '@blueprintjs/core'

import clsx from 'clsx'
import Fuse from 'fuse.js'
import { FC, Fragment, useMemo } from 'react'

import { useLevels } from '../apis/level'
import { createCustomLevel, isHardMode } from '../models/level'
import { Level } from '../models/operation'
import { Suggest } from './Suggest'

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

  // value 可以由用户输入，所以可以是任何值，只有用 stageId 才能匹配到唯一的关卡
  const selectedLevel = useMemo(
    () => levels.find((el) => el.stageId === value) ?? null,
    [levels, value],
  )

  const search = (query: string) => {
    // 如果 query 和当前关卡完全匹配（也就是唯一对应），就显示同类关卡
    if (selectedLevel && selectedLevel.stageId === query) {
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
        const header = createCustomLevel(headerName)
        header.stageId = 'header'
        return [header, ...similarLevels]
      }
    }

    return query ? fuse.search(query).map((el) => el.item) : levels
  }

  return (
    <Suggest<Level>
      updateQueryOnSelect
      items={levels}
      itemListPredicate={search}
      onReset={() => onChange('')}
      className={clsx(className, selectedLevel && '[&_input]:italic')}
      itemRenderer={(item, { handleClick, handleFocus, modifiers }) =>
        item.stageId === 'header' ? (
          <Fragment key="header">
            <div className="ml-2 text-zinc-500 text-xs">{item.name}</div>
            <MenuDivider />
          </Fragment>
        ) : (
          <MenuItem
            key={item.stageId}
            text={`${item.catThree} ${item.name}`}
            onClick={handleClick}
            onFocus={handleFocus}
            selected={modifiers.active}
            disabled={modifiers.disabled}
          />
        )
      }
      selectedItem={selectedLevel}
      onItemSelect={(level) => onChange(level.stageId)}
      inputValueRenderer={(item) => item.stageId}
      noResults={<MenuItem disabled text="没有可选的关卡" />}
      inputProps={{
        placeholder: '关卡名、关卡类型、关卡编号',
        leftIcon: 'area-of-interest',
        large: true,
        size: 64,
        onBlur: (e) => {
          // 失焦时直接把 query 提交上去，用于处理关卡未匹配的情况
          if (value !== e.target.value) {
            onChange(e.target.value)
          }
        },
      }}
    />
  )
}
