import { useAtomDevtools } from 'jotai-devtools'
import { noop } from 'lodash-es'
import { CopilotInfoStatusEnum } from 'maa-copilot-client'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { withGlobalErrorBoundary } from 'components/GlobalErrorBoundary'
import { OperationEditor } from 'components/editor2/Editor'

import { useOperation } from '../apis/operation'
import { withSuspensable } from '../components/Suspensable'
import {
  defaultEditorState,
  editorAtoms,
  historyAtom,
} from '../components/editor2/editor-state'
import { toEditorOperation } from '../components/editor2/reconciliation'
import { toCopilotOperation } from '../models/converter'
import { toShortCode } from '../models/shortCode'
import { AtomsHydrator } from '../utils/react'

export const EditorPage = withGlobalErrorBoundary(
  withSuspensable(() => {
    const params = useParams()
    const id = params.id ? +params.id : undefined
    const isNew = !id
    const submitAction = isNew ? '发布' : '更新'
    const apiOperation = useOperation({ id, suspense: true }).data

    if (process.env.NODE_ENV === 'development') {
      useAtomDevtools(historyAtom, { name: 'editorStateAtom' })
    }

    const initialEditorAtomValue = useMemo(
      () =>
        [
          [
            editorAtoms.editor,
            apiOperation
              ? {
                  operation: toEditorOperation(
                    toCopilotOperation(apiOperation),
                  ),
                  metadata: {
                    visibility:
                      apiOperation.status === CopilotInfoStatusEnum.Public
                        ? 'public'
                        : 'private',
                  },
                }
              : defaultEditorState,
          ],
        ] as const,
      [apiOperation],
    )

    return (
      <AtomsHydrator atomValues={initialEditorAtomValue}>
        <OperationEditor
          title={isNew ? '创建作业' : '修改作业 - ' + toShortCode({ id })}
          submitAction={isNew ? '发布作业' : '更新作业'}
          onSubmit={noop}
        />
      </AtomsHydrator>
    )
  }),
)
EditorPage.displayName = 'EditorPage'
