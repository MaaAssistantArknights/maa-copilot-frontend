import { Tag } from '@blueprintjs/core'

import { FC } from 'react'

import { EDifficulty } from 'components/entity/EDifficulty'
import { Level, OpDifficulty } from 'models/operation'

import { isCustomLevel } from '../../models/level'

export const ELevel: FC<{
  className?: string
  level: Level
}> = ({ level }) => {
  let { catOne, catTwo, catThree } = level

  if (isCustomLevel(level)) {
    catOne = '自定义关卡'
    catTwo = ''
    catThree = level.name
  }

  return (
    <Tag className="transition border border-solid !text-xs tracking-tight !px-2 !py-1 !my-1 leading-none !min-h-0 bg-slate-200 border-slate-300 text-slate-700">
      <div className="flex items-center">
        <div className="flex whitespace-pre">
          <span className="inline-block font-bold my-auto">{catThree}</span>
          {" | "}
          <span className="text-xs">{catTwo}</span>
          {" | "}
          <span className="text-xs">{catOne}</span>
        </div>
      </div>
    </Tag>
  )
}

export const EDifficultyLevel: FC<{
  level: Level
  difficulty?: OpDifficulty
}> = ({ level, difficulty = OpDifficulty.UNKNOWN }) => {
  return (
    <div className="flex flex-wrap">
      <ELevel level={level} />
      <EDifficulty difficulty={difficulty} />
    </div>
  )
}
