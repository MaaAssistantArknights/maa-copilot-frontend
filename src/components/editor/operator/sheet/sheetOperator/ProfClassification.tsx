import { Divider, H4, H5 } from '@blueprintjs/core'

import clsx from 'clsx'
import { FC, ImgHTMLAttributes, useEffect, useMemo, useState } from 'react'

import { PROFESSIONS } from 'models/operator'

import {
  DEFAULTPROFID,
  DEFAULTSUBPROFID,
  ProfFilter as ProfFilterOuter,
  useOperatorFilterProvider,
} from './SheetOperatorFilterProvider'
import { defaultPagination } from './ShowMore'

const formattedProfessions = [
  {
    id: DEFAULTPROFID.ALL,
    name: '全部',
    sub: [],
  },
  {
    id: DEFAULTPROFID.FAV,
    name: '收藏',
    sub: [],
  },
  ...PROFESSIONS,
  {
    id: DEFAULTPROFID.OTHERS,
    name: '其它',
    sub: [],
  },
]

type ProfFilter = ProfFilterOuter

export const defaultProfFilter: ProfFilter = {
  selectedProf: [DEFAULTPROFID.ALL, DEFAULTSUBPROFID.ALL],
}

export interface ProfClassificationProp {
  toTop: () => void
}

export const ProfClassification: FC<ProfClassificationProp> = ({ toTop }) => {
  const {
    useProfFilterState: [{ selectedProf }, setProfFilter],
    usePaginationFilterState: [_, setPaginationFilter],
  } = useOperatorFilterProvider()

  const subProfs = useMemo(() => {
    return [
      { id: DEFAULTSUBPROFID.ALL, name: '全部' },
      { id: DEFAULTSUBPROFID.SELECTED, name: '已选择' },
      ...(formattedProfessions.find(({ id }) => id === selectedProf[0])?.sub ||
        []),
    ]
  }, [selectedProf])

  useEffect(() => {
    toTop()
    setPaginationFilter(defaultPagination)
  }, [selectedProf, setPaginationFilter, toTop])

  return (
    <div className="flex flex-row-reverse relative h-full">
      <ul className="h-full flex flex-col w-6 sm:w-12">
        {formattedProfessions.map(({ id, name }) => (
          <ProfIcon
            key={id}
            profId={id}
            name={name}
            selected={selectedProf.includes(id)}
            onProfClick={() =>
              setProfFilter((prev) => ({
                ...prev,
                selectedProf: [id, DEFAULTSUBPROFID.ALL],
              }))
            }
          />
        ))}
      </ul>
      <Divider className="mr-0" />
      <ul className="h-full flex flex-col justify-center items-end absolute right-full sm:relative sm:left-0">
        {subProfs.map(({ id, name }) => (
          <li key={id}>
            <H4
              className={clsx(
                'truncate cursor-pointer my-3 opacity-50 hover:underline hover:opacity-90',
                selectedProf.includes(id) && '!opacity-100 underline',
                name.length > 3 && '!text-base',
              )}
              onClick={() =>
                setProfFilter(({ selectedProf, ...rest }) => ({
                  selectedProf: [selectedProf[0], id],
                  ...rest,
                }))
              }
            >
              {name}
            </H4>
          </li>
        ))}
      </ul>
    </div>
  )
}

interface ProfIconProp extends ImgHTMLAttributes<HTMLImageElement> {
  name: string
  profId: string
  selected: boolean
  onProfClick: () => void
}

const ProfIcon: FC<ProfIconProp> = ({
  name,
  profId,
  selected,
  onProfClick,
  ...restImgProps
}) => {
  const [imgError, setImgError] = useState(false)

  return (
    <li
      className="grow cursor-pointer relative flex justify-center items-center"
      title={name}
      role="presentation"
      onClick={onProfClick}
    >
      {imgError ? (
        <H5 className="!text-xs sm:!text-base truncate">{name}</H5>
      ) : (
        <img
          {...restImgProps}
          className="invert dark:invert-0"
          src={'/assets/prof-icons/' + profId + '.png'}
          alt=""
          onError={() => setImgError(true)}
          title={name}
        />
      )}
      {selected && (
        <div className="h-full w-1 bg-black dark:bg-white absolute top-0 right-full rounded" />
      )}
    </li>
  )
}
