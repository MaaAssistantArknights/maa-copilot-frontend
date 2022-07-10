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

  export interface Action {
    costChanges?: number
    direction?: Direction
    doc?: string
    docColor?: string
    kills?: number
    location?: any[]
    name: string
    preDelay?: number
    rearDelay?: number
    skillUsage?: number
    type?: Type
  }

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
    skillUsage?: number
  }

  export interface Requirements {
    elite?: number
    level?: number
    module?: number
    potentiality?: number
    skillLevel?: number
  }
}
