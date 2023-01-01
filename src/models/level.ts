/**
 * Note: In levels, the stageId is always unique, other fields may not be.
 *
 * With other fields conflicting, the stageId will be different in three ways:
 * 1. a001_ex04 / a001_ex04#f#
 * 2. ro1_e_1_1 / ro1_n_1_1
 * 3. act1bossrush_01 / act1bossrush_tm01
 *
 * Normally, levels of the last two kinds will never be used in Copilot,
 * so we do not care about them and just remove them from the list.
 */
import { Level } from './operation'

const HARD_MODE_SUFFIX = '#f#'

export function withoutUnusedLevels(levels: Level[]) {
  const unusedKeywords = [
    // 引航者试炼
    'bossrush',
    // 肉鸽
    'roguelike',
    // 保全派驻
    'legion',
  ]
  return levels.filter(
    (level) =>
      !unusedKeywords.some((keyword) => level.levelId.includes(keyword)),
  )
}

export function isHardMode(stageId: string) {
  return stageId.endsWith(HARD_MODE_SUFFIX)
}

export function toHardMode(stageId: string) {
  return isHardMode(stageId) ? stageId : stageId + HARD_MODE_SUFFIX
}

export function toNormalMode(stageId: string) {
  return isHardMode(stageId)
    ? stageId.slice(0, -HARD_MODE_SUFFIX.length)
    : stageId
}

export function findLevelByStageName(levels: Level[], stageName: string) {
  return levels.find((level) => matchLevelByStageName(level, stageName))
}

export function matchLevelByStageName(level: Level, stageName: string) {
  return (
    matchStageIdIgnoringDifficulty(level.stageId, stageName) ||
    level.levelId === stageName ||
    level.name === stageName
  )
}

export function matchStageIdIgnoringDifficulty(id1: string, id2: string) {
  return (
    id1 === id2 ||
    id1 === id2 + HARD_MODE_SUFFIX ||
    id1 + HARD_MODE_SUFFIX === id2
  )
}
