import { uniqueId } from 'lodash-es'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { SetRequired } from 'type-fest'

import { EditorPerformerAddProps } from '../../../editor/operator/EditorPerformerAdd'
import { SheetProvider } from '../../../editor/operator/sheet/SheetProvider'
import { OperatorFilterProvider } from '../../../editor/operator/sheet/sheetOperator/SheetOperatorFilterProvider'
import { EditorFormValues } from '../../editor-state'
import { SheetList } from './SheetList'

type EditorOperator = NonNullable<
  NonNullable<EditorFormValues['opers']>[number]
>
type EditorGroup = NonNullable<NonNullable<EditorFormValues['groups']>[number]>

const getId = (performer: EditorOperator | EditorGroup) => {
  // normally the id will never be undefined, but we need to make TS happy as well as handing edge cases
  return (performer._id ??= uniqueId())
}

export const OperatorSheet = () => {
  const { control } = useFormContext<EditorFormValues>()

  const {
    fields: operators,
    append: appendOperator,
    update: updateOperator,
    remove: removeOperator,
  } = useFieldArray({
    name: 'opers',
    control,
  })
  const {
    fields: groups,
    append: appendGroup,
    update: updateGroup,
    remove: removeGroup,
  } = useFieldArray({
    name: 'groups',
    control,
  })

  const findGroupByOperator = (operator?: EditorOperator) =>
    operator &&
    (groups.find((group) => group.opers?.includes(operator)) as
      | SetRequired<EditorGroup, 'opers'>
      | undefined)

  const submitOperator: EditorPerformerAddProps['submitOperator'] = (
    { groupName, ...operator },
    setError,
    fromSheet,
  ) => {
    if (
      operators.find(
        ({ name, _id }) => name === operator.name && _id !== operator._id,
      )
    ) {
      setError?.('name', { message: '干员已存在' })
      return false
    }

    let newGroup: EditorGroup | undefined
    let newGroupIndex = -1

    if (groupName) {
      newGroupIndex = groups.findIndex((group) => group.name === groupName)
      newGroup = groups[newGroupIndex]

      if (!newGroup) {
        newGroup = { name: groupName }
        newGroupIndex = groups.length
        submitGroup(newGroup, setError)
      }
    }

    const addOperator = () => {
      if (newGroup) {
        updateGroup(newGroupIndex, {
          ...newGroup,
          opers: [...(newGroup.opers || []), operator],
        })
      } else appendOperator(operator)
    }

    if (fromSheet && operator._id) {
      const existingOperator = operator
      operator._id = getId(existingOperator)

      const oldGroup = findGroupByOperator(existingOperator)
      if (oldGroup) {
        if (oldGroup === newGroup) {
          // replace existing operator in group
          updateGroup(groups.indexOf(oldGroup), {
            ...oldGroup,
            opers: oldGroup.opers.map((op) =>
              op === existingOperator ? operator : op,
            ),
          })
        } else {
          // remove existing operator from group
          updateGroup(groups.indexOf(oldGroup), {
            ...oldGroup,
            opers: oldGroup.opers.filter((op) => op !== existingOperator),
          })

          // add new operator to group
          addOperator()
        }
      } else {
        if (newGroup) {
          removeOperator(operators.indexOf(existingOperator))
          addOperator()
        } else {
          updateOperator(
            operators.findIndex(({ _id }) => _id === operator._id),
            operator,
          )
        }
      }
    } else {
      operator._id = uniqueId()
      addOperator()
    }
    return true
  }

  const submitGroup: EditorPerformerAddProps['submitGroup'] = (
    group,
    setError,
    fromSheet,
  ) => {
    if (
      groups.find(({ name, _id }) => name === group.name && _id !== group._id)
    ) {
      setError?.('name', { message: '干员组已存在' })
      return false
    }
    if (fromSheet && group._id) {
      const existingGroup = group
      group._id = getId(existingGroup)
      updateGroup(
        groups.findIndex(({ _id }) => _id === existingGroup._id),
        group,
      )
    } else {
      group._id = uniqueId()
      appendGroup(group)
      if (group.opers?.length) {
        removeOperator(
          group.opers
            ?.map((item) =>
              operators.findIndex(({ name }) => name === item.name),
            )
            .filter((item) => item !== -1),
        )
      }
    }

    return true
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
