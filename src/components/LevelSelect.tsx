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
  const fuseSimilar = useMemo(
    () =>
      new Fuse(levels, {
        keys: ['levelId'],
        threshold: 0,
      }),
    [levels],
  )

  // value 可以由用户输入，所以可以是任何值，只有用 stageId 才能匹配到唯一的关卡
  const selectedLevel = useMemo(
    () => levels.find((el) => el.stageId === value) ?? null,
    [levels, value],
  )

  return (
    <Suggest<Level>
      updateQueryOnSelect
      items={levels}
      itemListPredicate={(query) => {
        // 如果 query 和当前关卡完全匹配（也就是唯一对应），就显示同类关卡
        if (selectedLevel && selectedLevel.stageId === query) {
          const levelIdPrefix = selectedLevel.levelId
            .split('/')
            .slice(0, -1)
            .join('/')
          const similarLevels = fuseSimilar
            .search(levelIdPrefix)
            .map((el) => el.item)

          if (similarLevels.length > 0) {
            const header = createCustomLevel('header')
            // catTwo 一般是活动名，有时候是空的
            header.catTwo = selectedLevel.catTwo || '相关关卡'
            return [header, ...similarLevels]
          }
        }

        return query ? fuse.search(query).map((el) => el.item) : levels
      }}
      onReset={() => onChange('')}
      className={clsx(className, selectedLevel && '[&_input]:italic')}
      itemRenderer={(item, { handleClick, handleFocus, modifiers }) =>
        item.name === 'header' ? (
          <Fragment key="header">
            <div className="ml-2 text-zinc-500 text-xs">{item.catTwo}</div>
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
