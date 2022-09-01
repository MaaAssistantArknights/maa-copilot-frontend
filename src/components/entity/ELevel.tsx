import { Tag } from '@blueprintjs/core'
import { EDifficulty } from 'components/entity/EDifficulty'
import { Level, OpDifficulty } from 'models/operation'
import { FC } from 'react'

export const ELevel: FC<{
  className?: string
  level: Level
}> = ({ level }) => {
  const className =
    'transition border border-solid !text-xs tracking-tight !px-2 !py-1 !mx-1 !my-1 leading-none !min-h-0 bg-slate-200 border-slate-300 text-slate-700'
  return (
    <>
      <Tag className={className}>{level.catOne}</Tag>
      <Tag className={className}>{level.catTwo}</Tag>
      <Tag className={className}>{level.catThree}</Tag>
    </>
  )
}

export const EDifficultyLevel: FC<{
  level: Level
  difficulty: OpDifficulty
}> = ({ level, difficulty }) => {
  return (
    <div className="flex flex-wrap">
      <ELevel level={level} />
      <EDifficulty difficulty={difficulty} />
    </div>
  )
}
