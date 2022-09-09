/**
 * MAA Copilot 战斗协议 v1
 */
namespace CopilotDocV1 {
  export interface Operation {
    actions: Action[]
    doc?: Doc
    groups?: Group[]
    minimumRequired: string
    opers?: Operator[]
    /**
     * 必填。除危机合约外，均为关卡中文名
     */
    stageName: string
  }

  interface ActionBase {
    // Action common optional fields
    doc?: string
    docColor?: string
    costChanges?: number
    kills?: number
    preDelay?: number
    rearDelay?: number
  }

  export interface ActionDeploy extends ActionBase {
    direction: Direction
    // location: any[]
    // should be
    location: [number, number]
    name: string
    type: Type.Deploy
  }

  export type ActionSkillOrRetreat = ActionBase &
    (
      | {
          // location: any[]
          // should be
          location: [number, number]
          name?: string
          type: Type.Skill | Type.Retreat
        }
      | {
          // location?: any[]
          // should be
          location?: [number, number]
          name: string
          type: Type.Skill | Type.Retreat
        }
    )

  export interface ActionSkillUsage extends ActionBase {
    skillUsage: SkillUsageType
    type: Type.SkillUsage
  }

  export interface ActionUtil extends ActionBase {
    type: Type.SpeedUp | Type.BulletTime | Type.Output | Type.SkillDaemon
  }

  export type Action =
    | ActionDeploy
    | ActionSkillOrRetreat
    | ActionSkillUsage
    | ActionUtil

  export enum Direction {
    Down = 'Down',
    Left = 'Left',
    None = 'None',
    Right = 'Right',
    Up = 'Up',
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
  }

  export interface Doc {
    details?: string
    detailsColor?: string
    title?: string
    titleColor?: string
  }

  export interface Group {
    name: string
    opers?: Operator[]
  }

  export interface Operator {
    /**w
     * 必填
     */
    name: string
    requirements?: Requirements
    /**
     * 可选，默认 1，取值范围 [1, 3]
     */
    skill?: number
    skillUsage?: SkillUsageType
  }

  export type SkillUsageType = 0 | 1 | 2 | 3

  export interface Requirements {
    elite?: number
    level?: number
    module?: number
    potentiality?: number
    skillLevel?: number
  }
}

export { CopilotDocV1 }
