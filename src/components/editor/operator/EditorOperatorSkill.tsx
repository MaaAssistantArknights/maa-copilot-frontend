/*
 * @Author: Gemini2035 2530056984@qq.com
 * @Date: 2023-12-29 01:02:02
 * @LastEditors: Gemini2035 2530056984@qq.com
 * @LastEditTime: 2023-12-29 22:00:19
 * @FilePath: /maa-copilot-frontend/src/components/editor/operator/EditorOperatorSkill.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Button, IconName, MenuItem } from '@blueprintjs/core'
import { Select2 } from '@blueprintjs/select'

import { useMemo } from 'react'
import { useController } from 'react-hook-form'

import { EditorFieldProps } from 'components/editor/EditorFieldProps'
import type { CopilotDocV1 } from 'models/copilot.schema'

interface EditorOperatorSkillChoice {
  icon?: IconName
  title: string
  value: number | null
}
const EditorOperatorSkillSelect = Select2.ofType<EditorOperatorSkillChoice>()

interface EditorOperatorSkillProps
  extends EditorFieldProps<CopilotDocV1.Operator, number> {}

export const EditorOperatorSkill = ({
  name,
  control,
}: EditorOperatorSkillProps) => {
  const {
    field: { onChange, onBlur, value, ref },
  } = useController({
    name,
    control,
  })

  const items = useMemo<EditorOperatorSkillChoice[]>(
    () => [
      {
        icon: 'cog',
        title: '一技能',
        value: 1,
      },
      {
        icon: 'cog',
        title: '二技能',
        value: 2,
      },
      {
        icon: 'cog',
        title: '三技能',
        value: 3,
      },
    ],
    [],
  )

  const selected = items.find((item) => item.value === (value ?? 1))

  return (
    <EditorOperatorSkillSelect
      filterable={false}
      items={items}
      itemRenderer={(action, { handleClick, handleFocus, modifiers }) => (
        <MenuItem
          selected={modifiers.active}
          key={action.value}
          onClick={handleClick}
          onFocus={handleFocus}
          icon={action.icon}
          text={action.title}
        />
      )}
      onItemSelect={(item) => {
        onChange(item.value)
      }}
    >
      <Button
        icon={selected?.icon}
        text={selected?.title}
        rightIcon="double-caret-vertical"
        onBlur={onBlur}
        ref={ref}
      />
    </EditorOperatorSkillSelect>
  )
}
