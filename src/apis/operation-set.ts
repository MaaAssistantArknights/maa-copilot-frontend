import { useAtomValue } from 'jotai'
import { noop } from 'lodash-es'
import {
  CopilotSetPageRes,
  CopilotSetQuery,
  CopilotSetStatus,
  CopilotSetUpdateReq,
} from 'maa-copilot-client'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'

import { authAtom } from 'store/auth'
import { OperationSetApi } from 'utils/maa-copilot-client'
import { useSWRRefresh } from 'utils/swr'

import { parseShortCode } from '../models/shortCode'

export type OrderBy = 'views' | 'hot' | 'id'

export interface UseOperationSetsParams {
  keyword?: string
  byMyself?: boolean

  disabled?: boolean
  suspense?: boolean
}

export function useOperationSets({
  keyword,
  byMyself,
  disabled,
  suspense,
}: UseOperationSetsParams) {
  const { userId } = useAtomValue(authAtom)

  const {
    data: pages,
    error,
    setSize,
    isValidating,
  } = useSWRInfinite(
    (pageIndex, previousPage: CopilotSetPageRes) => {
      if (disabled) {
        return null
      }
      if (previousPage && !previousPage.hasNext) {
        return null // reached the end
      }

      return [
        'operationSets',
        {
          limit: 50,
          page: pageIndex + 1,
          keyword,
          creatorId: byMyself ? userId : undefined,
        } satisfies CopilotSetQuery,
        byMyself,
      ]
    },
    async ([, req, byMyself]) => {
      const res = await new OperationSetApi({
        sendToken: byMyself ? 'always' : 'optional', // 如果有 token 会用来获取自己的作业集
        requireData: true,
      }).querySets({ copilotSetQuery: req })
      return res.data
    },
    {
      suspense,
      focusThrottleInterval: 1000 * 60 * 30,
    },
  )

  const isReachingEnd = !!pages?.some((page) => !page.hasNext)
  const operationSets = pages?.map((page) => page.data).flat()

  return {
    operationSets,
    error,
    setSize,
    isValidating,
    isReachingEnd,
  }
}

export function useRefreshOperationSets() {
  const refresh = useSWRRefresh()
  return () =>
    refresh(
      (key) =>
        key.includes('operationSets') ||
        (key.includes('operationSet') && key.includes('fromList')),
    )
}

export function useOperationSetSearch({
  keyword,
  suspense,
  disabled,
  ...params
}: UseOperationSetsParams) {
  if (!suspense) {
    throw new Error('useOperationSetSearch must be used with suspense')
  }
  if (disabled) {
    throw new Error('useOperationSetSearch cannot be disabled')
  }

  let id: number | undefined

  if (keyword) {
    const shortCodeContent = parseShortCode(keyword)

    if (shortCodeContent) {
      id = shortCodeContent.id
    }
  }

  const { data: operationSet } = useOperationSet({ id, suspense })

  const listResponse = useOperationSets({
    keyword,
    suspense,
    ...params,

    // disable the list query if we are fetching a single operation set
    disabled: !!id,
  })

  if (id) {
    return {
      operationSets: [operationSet],
      isReachingEnd: true,
      setSize: noop,

      // these are fixed values in suspense mode
      error: undefined,
      isValidating: false,
    }
  }

  return listResponse
}

interface UseOperationSetParams {
  id?: number
  suspense?: boolean
}

export function useOperationSet({ id, suspense }: UseOperationSetParams) {
  return useSWR(
    id ? ['operationSet', id] : null,
    () => getOperationSet({ id: id! }),
    { suspense },
  )
}

export function useRefreshOperationSet() {
  const refresh = useSWRRefresh()
  return (id: number) =>
    refresh((key) => key.includes('operationSet') && key.includes(String(id)))
}

export async function getOperationSet(req: { id: number }) {
  const res = await new OperationSetApi({
    sendToken: 'optional', // 如果有 token 会用来获取用户是否点赞
    requireData: true,
  }).getSet(req)
  return res.data
}

export async function createOperationSet(req: {
  name: string
  description: string
  operationIds: number[]
  status: CopilotSetStatus
}) {
  await new OperationSetApi().createSet({
    copilotSetCreateReq: {
      name: req.name,
      description: req.description,
      copilotIds: req.operationIds,
      status: req.status,
    },
  })
}

export async function updateOperationSet(req: CopilotSetUpdateReq) {
  await new OperationSetApi().updateCopilotSet({ copilotSetUpdateReq: req })
}

export async function deleteOperationSet(req: { id: number }) {
  await new OperationSetApi().deleteCopilotSet({ commonIdReqLong: req })
}

export async function addToOperationSet(req: {
  operationSetId: number
  operationIds: number[]
}) {
  await new OperationSetApi().addCopilotIds({
    copilotSetModCopilotsReq: {
      id: req.operationSetId,
      copilotIds: req.operationIds,
    },
  })
}

export async function removeFromOperationSet(req: {
  operationSetId: number
  operationIds: number[]
}) {
  await new OperationSetApi().removeCopilotIds({
    copilotSetModCopilotsReq: {
      id: req.operationSetId,
      copilotIds: req.operationIds,
    },
  })
}
