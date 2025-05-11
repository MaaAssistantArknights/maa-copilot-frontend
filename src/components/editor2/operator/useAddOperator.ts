import { produce } from 'immer'
import { useAtomCallback } from 'jotai/utils'
import { useCallback } from 'react'

import { AppToaster } from '../../Toaster'
import { EditorOperator, editorAtoms, useEdit } from '../editor-state'

export function useAddOperator() {
  const edit = useEdit()
  return useAtomCallback(
    useCallback(
      (get, set, operator: EditorOperator, groupId?: string) => {
        const operatorNames = get(editorAtoms.operators).map((op) => op.name)
        const groupedOperatorNames = get(editorAtoms.groups).flatMap((g) =>
          g.opers.map((op) => op.name),
        )
        if (
          operatorNames.includes(operator.name) ||
          groupedOperatorNames.includes(operator.name)
        ) {
          AppToaster.show({
            message: '干员已存在',
            intent: 'danger',
          })
          return
        }
        edit(() => {
          if (groupId) {
            set(editorAtoms.groups, (groups) =>
              produce(groups, (draft) => {
                const group = draft.find((g) => g.id === groupId)
                if (group) {
                  group.opers.push(operator)
                }
              }),
            )
          } else {
            set(editorAtoms.operatorAtoms, {
              type: 'insert',
              value: operator,
            })
          }
          return {
            action: 'add-operator',
            desc: '添加干员',
            squash: false,
          }
        })
      },
      [edit],
    ),
  )
}
