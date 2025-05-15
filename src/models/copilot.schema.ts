import { OpDifficulty } from './operation'

/**
 * MAA Copilot 战斗协议 v1
 * https://maa.plus/docs/zh-cn/protocol/copilot-schema.html
 */
export namespace CopilotDocV1 {
  export interface Operation {
    actions?: Action[]
    doc: Doc
    groups?: Group[]
    minimumRequired: string
    opers?: Operator[]
    /**
     * 必填。除危机合约外，均为关卡中文名
     */
    stageName: string
    difficulty?: OpDifficulty
  }

  export type OperationSnakeCased =
    import('type-fest').SnakeCasedPropertiesDeep<Operation>

  interface ActionBase {
    /** Required in editor; should be stripped when exporting. */
    _id?: string
    // Action common optional fields
    doc?: string
    docColor?: string
    costs?: number
    costChanges?: number
    kills?: number
    cooling?: number
    preDelay?: number
    rearDelay?: number
    postDelay?: number
  }

  export interface ActionDeploy extends ActionBase {
    direction: Direction
    // location: any[]
    // should be
    location: [number, number]
    name: string
    type: Type.Deploy
  }

  export type ActionSkillOrRetreatOrBulletTime = ActionBase &
    (
      | {
          // location: any[]
          // should be
          location: [number, number]
          name?: string
          type: Type.Skill | Type.Retreat | Type.BulletTime
        }
      | {
          // location?: any[]
          // should be
          location?: [number, number]
          name: string
          type: Type.Skill | Type.Retreat | Type.BulletTime
        }
    )

  export interface ActionSkillUsage extends ActionBase {
    name: string
    skillUsage: SkillUsageType
    type: Type.SkillUsage
    skillTimes?: number
  }

  export interface ActionUtil extends ActionBase {
    type: Type.SpeedUp | Type.Output | Type.SkillDaemon
  }

  export interface ActionMoveCamera extends ActionBase {
    type: Type.MoveCamera
    distance: [number, number]
  }

  export type Action =
    | ActionDeploy
    | ActionSkillOrRetreatOrBulletTime
    | ActionSkillUsage
    | ActionUtil
    | ActionMoveCamera

  export enum Direction {
    Left = 'Left',
    Right = 'Right',
    Up = 'Up',
    Down = 'Down',
    None = 'None',
  }

  export enum Type {
    BulletTime = 'BulletTime',
    Deploy = 'Deploy',
    Output = 'Output',
    Retreat = 'Retreat',
    Skill = 'Skill',
    SkillDaemon = 'SkillDaemon',
    SkillUsage = 'SkillUsage',
    SpeedUp = 'SpeedUp',
    MoveCamera = 'MoveCamera',
  }

  export interface Doc {
    details?: string
    detailsColor?: string
    title: string
    titleColor?: string
  }

  export interface Group {
    /** Required in editor; should be stripped when exporting. */
    _id?: string
    name: string
    opers?: Operator[]
  }

  export interface Operator {
    /** Required in editor; should be stripped when exporting. */
    _id?: string
    /**
     * 必填
     */
    name: string
    requirements?: Requirements
    /**
     * 可选，默认 1，取值范围 [1, 3]
     */
    skill?: number
    skillUsage?: SkillUsageType
    /**
     * 技能使用次数，可选，默认为 1
     */
    skillTimes?: number
  }

  export enum SkillUsageType {
    /**
     * 不自动使用
     */
    None = 0,
    /**
     * 好了就用
     */
    ReadyToUse = 1,
    /**
     * 好了就用-指定次数
     */
    ReadyToUseTimes = 2,
    /**
     * 自动使用
     */
    Automatically = 3,
  }

  export type SkillTimes = number

  export interface Requirements {
    elite?: number
    level?: number
    module?: number
    potentiality?: number
    skillLevel?: number
  }
}
