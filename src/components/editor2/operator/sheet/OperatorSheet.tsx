import { produce } from 'immer'
import { useAtom } from 'jotai'
import { uniqueId } from 'lodash-es'

import { CopilotDocV1 } from '../../../../models/copilot.schema'
import { SheetProvider } from '../../../editor/operator/sheet/SheetProvider'
import { OperatorFilterProvider } from '../../../editor/operator/sheet/sheetOperator/SheetOperatorFilterProvider'
import {
  EditorGroup,
  EditorOperation,
  EditorOperator,
  editorAtoms,
  useEdit,
} from '../../editor-state'
import {
  createGroup,
  createOperator,
  getInternalId,
} from '../../reconciliation'
import { SheetList } from './SheetList'

// TODO: 兼容性处理，以后要去掉
const ensureEditorOperator = (
  operation: EditorOperation,
  operator: CopilotDocV1.Operator,
): EditorOperator => {
  if (operator._id) {
    return operator as EditorOperator
  }
  const matchedOperator = operation.opers.find(
    (op) => op.name === operator.name,
  )
  if (matchedOperator) {
    return matchedOperator
  }
  for (const group of operation.groups) {
    const matchedOperator = group.opers.find((op) => op.name === operator.name)
    if (matchedOperator) {
      return matchedOperator
    }
  }
  return { ...operator, _id: uniqueId() }
}

const ensureEditorGroup = (
  operation: EditorOperation,
  group: CopilotDocV1.Group,
): EditorGroup => {
  if (group._id) {
    return group as EditorGroup
  }
  const matchedGroup = operation.groups.find((g) => g.name === group.name)
  if (matchedGroup) {
    return matchedGroup
  }
  return {
    ...group,
    _id: uniqueId(),
    opers: group.opers?.map((op) => ensureEditorOperator(operation, op)) || [],
  }
}

export const OperatorSheet = () => {
  const [operators] = useAtom(editorAtoms.operators)
  const [groups] = useAtom(editorAtoms.groups)
  const edit = useEdit()

  const submitOperator = (_operator: CopilotDocV1.Operator) => {
    edit((get, set, skip) => {
      let checkpoint = skip
      const operation = get(editorAtoms.operation)
      const operator = ensureEditorOperator(operation, _operator)

      const newOperation = produce(operation, (draft) => {
        let targetOperator = draft.opers.find(
          (op) => getInternalId(op) === getInternalId(operator),
        )
        if (!targetOperator) {
          for (const group of draft.groups) {
            targetOperator = group.opers.find(
              (op) => getInternalId(op) === getInternalId(operator),
            )
            if (targetOperator) {
              break
            }
          }
        }
        if (targetOperator) {
          Object.assign(targetOperator, operator)
          checkpoint = {
            action: 'update-operator',
            desc: '更新干员',
            squash: false,
          }
        } else {
          const newOperator = createOperator(operator)
          const activeGroupId = get(editorAtoms.activeGroupIdAtom)
          if (activeGroupId) {
            const activeGroup = draft.groups.find(
              (g) => getInternalId(g) === activeGroupId,
            )
            activeGroup?.opers.push(newOperator)
          } else {
            draft.opers.push(newOperator)
          }
          checkpoint = {
            action: 'add-operator',
            desc: '添加干员',
            squash: false,
          }
        }
      })
      set(editorAtoms.operation, newOperation)
      return checkpoint
    })
    return true
  }

  const submitGroup = (_group: CopilotDocV1.Group) => {
    edit((get, set, skip) => {
      let checkpoint = skip
      const operation = get(editorAtoms.operation)
      const group = ensureEditorGroup(operation, _group)

      const newOperation = produce(operation, (draft) => {
        const targetGroup = draft.groups.find(
          (g) => getInternalId(g) === getInternalId(group),
        )
        if (targetGroup) {
          Object.assign(targetGroup, group)
          checkpoint = {
            action: 'update-group',
            desc: '更新干员组',
            squash: false,
          }
        } else {
          draft.groups.push(createGroup(group))
          checkpoint = {
            action: 'add-group',
            desc: '添加干员组',
            squash: false,
          }
        }
      })
      set(editorAtoms.operation, newOperation)
      return checkpoint
    })
    return true
  }

  const removeOperator = (index: number | number[] | undefined) => {
    if (index === undefined || index === -1) return
    if (typeof index === 'number') {
      index = [index]
    }
    edit((get, set) => {
      set(editorAtoms.operation, (operation) =>
        produce(operation, (draft) => {
          draft.opers = draft.opers.filter((_, i) => !index.includes(i))
        }),
      )
      return {
        action: 'remove-operator',
        desc: '移除干员',
        squash: false,
      }
    })
  }

  const removeGroup = (index: number | number[] | undefined) => {
    if (index === undefined || index === -1) return
    if (typeof index === 'number') {
      index = [index]
    }
    edit((get, set) => {
      set(editorAtoms.operation, (operation) =>
        produce(operation, (draft) => {
          draft.groups = draft.groups.filter((_, i) => !index.includes(i))
        }),
      )
      return {
        action: 'remove-group',
        desc: '移除干员组',
        squash: false,
      }
    })
  }

  return (
    <SheetProvider
      submitOperator={submitOperator}
      submitGroup={submitGroup}
      existedOperators={operators}
      existedGroups={groups}
      removeOperator={removeOperator}
      removeGroup={removeGroup}
    >
      <OperatorFilterProvider>
        <SheetList />
      </OperatorFilterProvider>
    </SheetProvider>
  )
}
