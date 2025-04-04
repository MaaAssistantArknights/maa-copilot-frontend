import {
  Button,
  Checkbox,
  Dialog,
  DialogBody,
  DialogFooter,
  H6,
  Tag,
} from '@blueprintjs/core'

import clsx from 'clsx'
import { getDefaultStore, useAtom } from 'jotai'
import { compact } from 'lodash-es'
import { FC, useEffect, useMemo, useState } from 'react'

import { OPERATORS } from '../models/operator'
import {
  DEFAULT_OPERATOR_FILTER,
  OperatorFilterData,
  operatorFilterAtom,
} from '../store/selectedOperators'
import { OperatorSelect } from './OperatorSelect'
import { OperatorAvatar } from './editor/operator/EditorOperator'

export function useOperatorFilter() {
  const [operatorFilter, setOperatorFilter] = useState<OperatorFilterData>(
    () => {
      // 用本地保存的干员过滤器来初始化
      const savedOperatorFilter = getDefaultStore().get(operatorFilterAtom)
      if (savedOperatorFilter.save) {
        return savedOperatorFilter
      }
      return { ...DEFAULT_OPERATOR_FILTER, save: false }
    },
  )

  return {
    operatorFilter,
    setOperatorFilter,
  }
}

interface OperatorFilterProps {
  className?: string
  filter: OperatorFilterData
  onChange: (filter: OperatorFilterData) => void
}

export const OperatorFilter: FC<OperatorFilterProps> = ({
  className,
  filter,
  onChange,
}) => {
  const [savedFilter, setSavedFilter] = useAtom(operatorFilterAtom)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFilter, setEditingFilter] = useState<typeof savedFilter>(filter)

  useEffect(() => {
    // 对话框关闭时还原
    if (!dialogOpen) {
      setEditingFilter(filter)
    }
  }, [dialogOpen, filter])

  const { includedOperators, excludedOperators } = useMemo(
    () => ({
      includedOperators: compact(
        filter.included.map((name) =>
          OPERATORS.find((operator) => operator.name === name),
        ),
      ),
      excludedOperators: compact(
        filter.excluded.map((name) =>
          OPERATORS.find((operator) => operator.name === name),
        ),
      ),
    }),
    [filter],
  )

  const updateEditingFilter = (included?: string[], excluded?: string[]) => {
    // 当两个数组中的干员冲突时，保留最新的
    if (included && !excluded) {
      excluded = editingFilter.excluded.filter(
        (name) => !included!.includes(name),
      )
    } else if (!included && excluded) {
      included = editingFilter.included.filter(
        (name) => !excluded!.includes(name),
      )
    } else {
      included = editingFilter.included
      excluded = editingFilter.excluded
    }
    setEditingFilter({
      ...editingFilter,
      included,
      excluded,
    })
  }

  const submit = () => {
    onChange(editingFilter)

    if (editingFilter.save) {
      setSavedFilter(editingFilter)
    } else if (savedFilter.save) {
      setSavedFilter({
        ...savedFilter,
        save: false,
      })
    }
  }

  const handleSave = (save: boolean) => {
    setEditingFilter({ ...editingFilter, save })
  }

  const handleEnable = (enabled: boolean) => {
    onChange({ ...filter, enabled })
    setEditingFilter({ ...editingFilter, enabled })
    if (savedFilter.save) {
      setSavedFilter({ ...savedFilter, enabled })
    }
  }

  return (
    <div className={clsx('flex items-center', className)}>
      {includedOperators.length > 0 || excludedOperators.length > 0 ? (
        <>
          <Button minimal onClick={() => setDialogOpen(true)} className="!p-1">
            <div
              className={clsx(
                'flex flex-wrap gap-1',
                !filter.enabled && 'opacity-30',
              )}
            >
              {includedOperators.map(({ id, name, rarity }) => (
                <Tag minimal key={id} className="py-0 pl-0" intent="primary">
                  <div className="flex items-center gap-1 text-sm">
                    <OperatorAvatar
                      className="w-8 h-8"
                      id={id}
                      rarity={rarity}
                    />
                    &nbsp;{name}&nbsp;
                  </div>
                </Tag>
              ))}
              {excludedOperators.map(({ id, name, rarity }) => (
                <Tag minimal key={id} className="py-0 pl-0" intent="danger">
                  <div className="flex items-center gap-1 text-sm line-through">
                    <OperatorAvatar
                      className="w-8 h-8"
                      id={id}
                      rarity={rarity}
                    />
                    &nbsp;{name}&nbsp; {/* 两边加空格让删除线更显眼一些 */}
                  </div>
                </Tag>
              ))}
            </div>
          </Button>
          <Button
            minimal
            icon="power"
            title="禁用干员选择"
            active={!editingFilter.enabled}
            onClick={() => handleEnable(!editingFilter.enabled)}
          />
        </>
      ) : (
        <Button
          minimal
          className="!px-3"
          icon="plus"
          onClick={() => setDialogOpen(true)}
        >
          干员
        </Button>
      )}
      <Dialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="选择干员"
      >
        <DialogBody>
          <H6 className="mb-4">包含的干员</H6>
          <OperatorSelect
            operators={editingFilter.included}
            onChange={(included) => updateEditingFilter(included, undefined)}
          />
          <H6 className="mt-6 mb-4">排除的干员</H6>
          <OperatorSelect
            operators={editingFilter.excluded}
            onChange={(excluded) => updateEditingFilter(undefined, excluded)}
          />
          <p className="mt-2 opacity-75">输入干员名、拼音或拼音首字母以搜索</p>
        </DialogBody>
        <DialogFooter
          actions={
            <>
              <Button minimal icon="cross" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button
                intent="primary"
                icon="tick"
                onClick={() => {
                  submit()
                  setDialogOpen(false)
                }}
              >
                确认
              </Button>
            </>
          }
        >
          <Checkbox
            className="inline-block mb-0"
            checked={editingFilter.save}
            onChange={(e) => handleSave(e.currentTarget.checked)}
          >
            记住选择
          </Checkbox>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
