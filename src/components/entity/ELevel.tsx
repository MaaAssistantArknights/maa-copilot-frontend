import { EDifficulty } from 'components/entity/EDifficulty'
import { Level, OpDifficulty } from 'models/operation'
import { FC } from 'react'

export const ELevel: FC<{
  className?: string
  level: Level
}> = ({ className, level }) => {
  return (
    <span className={className}>
      {level.catOne} {level.catThree}
    </span>
  )
}

export const EDifficultyLevel: FC<{
  level: Level
  difficulty: OpDifficulty
}> = ({ level, difficulty }) => {
  return (
    <>
      <ELevel className="mr-2" level={level} />
      <EDifficulty difficulty={difficulty} />
    </>
  )
}
