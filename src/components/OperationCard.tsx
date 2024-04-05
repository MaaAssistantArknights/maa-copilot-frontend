import { Button, Card, Elevation, H4, H5, Icon, Tag } from '@blueprintjs/core'
import { Tooltip2 } from '@blueprintjs/popover2'

import clsx from 'clsx'
import { handleCopyShortCode, handleDownloadJSON } from 'services/operation'

import { ReLink } from 'components/ReLink'
import { RelativeTime } from 'components/RelativeTime'
import { AddToOperationSetButton } from 'components/operation-set/AddToOperationSet'
import { OperationRating } from 'components/viewer/OperationRating'
import { OpDifficulty, Operation } from 'models/operation'

import { useLevels } from '../apis/level'
import { createCustomLevel, findLevelByStageName } from '../models/level'
import { Paragraphs } from './Paragraphs'
import { EDifficulty } from './entity/EDifficulty'
import { EDifficultyLevel, NeoELevel } from './entity/ELevel'

export const NeoOperationCard = ({ operation }: { operation: Operation }) => {
  const { data: levels } = useLevels()

  return (
    <Card
      interactive={true}
      elevation={Elevation.TWO}
      className="relative flex flex-col gap-2"
    >
      <ReLink search={{ op: operation.id }} className="block no-underline">
        <div className="flex">
          <Tooltip2
            content={operation.parsedContent.doc.title}
            className="grow flex-1 whitespace-nowrap overflow-hidden text-ellipsis"
          >
            <H4 className="p-0 m-0 mr-20 whitespace-nowrap overflow-hidden text-ellipsis">
              {operation.parsedContent.doc.title}
            </H4>
          </Tooltip2>
        </div>
        <div className="flex items-center text-slate-900">
          <div className="flex flex-wrap">
            <NeoELevel
              level={
                findLevelByStageName(
                  levels,
                  operation.parsedContent.stageName,
                ) || createCustomLevel(operation.parsedContent.stageName)
              }
            />
            <EDifficulty
              difficulty={
                operation.parsedContent.difficulty ?? OpDifficulty.UNKNOWN
              }
            />
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2 justify-center">
          <div className="text-gray-700 leading-normal">
            <Paragraphs
              content={operation.parsedContent.doc.details}
              limitHeight={21 * 13.5} // 13 lines, 21px per line; the extra 0.5 line is intentional so the `mask` effect is obvious
            />
          </div>
          <div>
            <div className="text-sm text-zinc-600 mb-2 font-bold">
              干员/干员组
            </div>
            <OperatorTags operation={operation} />
          </div>
        </div>

        <div className="flex">
          <div className="flex items-center gap-1.5">
            <Icon icon="star" />
            <OperationRating
              className="text-sm"
              operation={operation}
              layout="horizontal"
            />
          </div>
          <div className="flex-1" />

          <Tooltip2 placement="top" content={`访问量：${operation.views}`}>
            <div>
              <Icon icon="eye-open" className="mr-1.5" />
              <span>{operation.views}</span>
            </div>
          </Tooltip2>
        </div>

        <div className="flex">
          <div>
            <Icon icon="time" className="mr-1.5" />
            <RelativeTime
              Tooltip2Props={{ placement: 'top' }}
              moment={operation.uploadTime}
            />
          </div>
          <div className="flex-1" />
          <div className="text-zinc-500">
            <Tooltip2 placement="top" content={`作者：${operation.uploader}`}>
              <div>
                <Icon icon="user" className="mr-1.5" />
                <span>{operation.uploader}</span>
              </div>
            </Tooltip2>
          </div>
        </div>
      </ReLink>

      <CardActions className="absolute top-4 right-4" operation={operation} />
    </Card>
  )
}

export const OperationCard = ({ operation }: { operation: Operation }) => {
  const { data: levels } = useLevels()

  return (
    <Card
      interactive={true}
      elevation={Elevation.TWO}
      className="relative mb-4 sm:mb-2 last:mb-0"
    >
      <ReLink search={{ op: operation.id }} className="block no-underline">
        <div className="flex flex-wrap mb-4 sm:mb-2">
          {/* title */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <H4 className="inline-block pb-1 border-b-2 border-zinc-200 border-solid mb-2">
                {operation.parsedContent.doc.title}
              </H4>
            </div>
            <H5 className="flex items-center text-slate-900 -mt-3">
              <EDifficultyLevel
                level={
                  findLevelByStageName(
                    levels,
                    operation.parsedContent.stageName,
                  ) || createCustomLevel(operation.parsedContent.stageName)
                }
                difficulty={operation.parsedContent.difficulty}
              />
            </H5>
          </div>

          <div className="grow basis-full xl:basis-0" />

          {/* meta */}
          <div className="flex flex-wrap items-start gap-x-4 gap-y-1 text-zinc-500">
            <div className="flex items-center gap-1.5">
              <Icon icon="star" />
              <OperationRating
                className="text-sm"
                operation={operation}
                layout="horizontal"
              />
            </div>

            <Tooltip2 placement="top" content={`访问量：${operation.views}`}>
              <div>
                <Icon icon="eye-open" className="mr-1.5" />
                <span>{operation.views}</span>
              </div>
            </Tooltip2>

            <div>
              <Icon icon="time" className="mr-1.5" />
              <RelativeTime
                Tooltip2Props={{ placement: 'top' }}
                moment={operation.uploadTime}
              />
            </div>

            <Tooltip2 placement="top" content={`作者：${operation.uploader}`}>
              <div>
                <Icon icon="user" className="mr-1.5" />
                <span>{operation.uploader}</span>
              </div>
            </Tooltip2>
          </div>
        </div>
        <div className="flex md:flex-row flex-col gap-4">
          <div className="text-gray-700 leading-normal md:w-1/2">
            <Paragraphs
              content={operation.parsedContent.doc.details}
              limitHeight={21 * 13.5} // 13 lines, 21px per line; the extra 0.5 line is intentional so the `mask` effect is obvious
            />
          </div>
          <div className="md:w-1/2">
            <div className="text-sm text-zinc-600 mb-2 font-bold">
              干员/干员组
            </div>
            <OperatorTags operation={operation} />
          </div>
        </div>
      </ReLink>

      <CardActions
        className="absolute top-4 xl:top-12 right-[18px]"
        operation={operation}
      />
    </Card>
  )
}

const OperatorTags = ({ operation }: { operation: Operation }) => {
  const { opers, groups } = operation.parsedContent

  return opers?.length || groups?.length ? (
    <div>
      {opers?.map(({ name, skill }, index) => (
        <Tag key={index} className="mr-2 last:mr-0 mb-1 last:mb-0">
          {`${name} ${skill ?? 1}`}
        </Tag>
      ))}
      {groups?.map(({ name, opers }, index) => (
        <Tooltip2
          key={index}
          className="mr-2 last:mr-0 mb-1 last:mb-0"
          placement="top"
          content={
            opers
              ?.map(({ name, skill }) => `${name} ${skill ?? 1}`)
              .join(', ') || '无干员'
          }
        >
          <Tag>[{name}]</Tag>
        </Tooltip2>
      ))}
    </div>
  ) : (
    <div className="text-gray-500">无记录</div>
  )
}

const CardActions = ({
  className,
  operation,
}: {
  className?: string
  operation: Operation
}) => {
  return (
    <div className={clsx('flex gap-1', className)}>
      <Tooltip2
        placement="bottom"
        content={
          <div className="max-w-sm dark:text-slate-900">下载原 JSON</div>
        }
      >
        <Button
          small
          icon="download"
          onClick={() => handleDownloadJSON(operation.parsedContent)}
        />
      </Tooltip2>
      <Tooltip2
        placement="bottom"
        content={
          <div className="max-w-sm dark:text-slate-900">复制神秘代码</div>
        }
      >
        <Button
          small
          icon="clipboard"
          onClick={() => handleCopyShortCode(operation)}
        />
      </Tooltip2>
      <Tooltip2
        placement="bottom"
        content={
          <div className="max-w-sm dark:text-slate-900">添加到作业集</div>
        }
      >
        <AddToOperationSetButton small icon="plus" operationId={operation.id} />
      </Tooltip2>
    </div>
  )
}
