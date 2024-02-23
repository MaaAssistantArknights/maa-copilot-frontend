import {
  Button,
  Card,
  Drawer,
  DrawerSize,
  Elevation,
  H4,
  H5,
  Icon,
  Tag,
} from '@blueprintjs/core'
import { Tooltip2 } from '@blueprintjs/popover2'

import { useState } from 'react'
import { handleCopyShortCode, handleDownloadJSON } from 'services/operation'

import { RelativeTime } from 'components/RelativeTime'
import { OperationRating } from 'components/viewer/OperationRating'
import { OpDifficulty, OperationListItem } from 'models/operation'

import { useLevels } from '../apis/arknights'
import { CopilotDocV1 } from '../models/copilot.schema'
import { createCustomLevel, findLevelByStageName } from '../models/level'
import { Paragraphs } from './Paragraphs'
import { EDifficulty } from './entity/EDifficulty'
import { EDifficultyLevel, NeoELevel } from './entity/ELevel'
import { OperationViewer } from './viewer/OperationViewer'

export const NeoOperationCard = ({
  operation,
  operationDoc,
}: {
  operation: OperationListItem
  operationDoc: CopilotDocV1.Operation
}) => {
  const levels = useLevels()?.data?.data || []
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <Drawer
        size={DrawerSize.LARGE}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <OperationViewer
          operationId={operation.id}
          onCloseDrawer={() => setDrawerOpen(false)}
        />
      </Drawer>

      <Card
        interactive={true}
        elevation={Elevation.TWO}
        className="flex flex-col gap-2"
        onClick={() => setDrawerOpen(true)}
      >
        {/* title */}
        <div className="flex gap-1">
          <Tooltip2
            content={operationDoc.doc.title}
            className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis"
          >
            <H4 className="p-0 m-0 whitespace-nowrap overflow-hidden text-ellipsis">
              {operationDoc.doc.title}
            </H4>
          </Tooltip2>
          <Tooltip2
            placement="bottom"
            content={
              <div className="max-w-sm dark:text-slate-900">下载原 JSON</div>
            }
          >
            <Button
              small
              icon="download"
              onClick={(e) => {
                e.stopPropagation()
                handleDownloadJSON(operationDoc)
              }}
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
              onClick={(e) => {
                e.stopPropagation()
                handleCopyShortCode(operation)
              }}
            />
          </Tooltip2>
        </div>
        <div className="flex items-center text-slate-900">
          <div className="flex flex-wrap">
            <NeoELevel
              level={
                findLevelByStageName(levels, operationDoc.stageName) ||
                createCustomLevel(operationDoc.stageName)
              }
            />
            <EDifficulty
              difficulty={operationDoc.difficulty ?? OpDifficulty.UNKNOWN}
            />
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2 justify-center">
          <div className="text-gray-700 leading-normal">
            <Paragraphs
              content={operationDoc.doc.details}
              limitHeight={21 * 13.5} // 13 lines, 21px per line; the extra 0.5 line is intentional so the `mask` effect is obvious
            />
          </div>
          <div>
            <div className="text-sm text-zinc-600 mb-2 font-bold">
              干员/干员组
            </div>
            <OperatorTags operationDoc={operationDoc} />
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
      </Card>
    </>
  )
}

export const OperationCard = ({
  operation,
  operationDoc,
}: {
  operation: OperationListItem
  operationDoc: CopilotDocV1.Operation
}) => {
  const levels = useLevels()?.data?.data || []
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <Drawer
        size={DrawerSize.LARGE}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <OperationViewer
          operationId={operation.id}
          onCloseDrawer={() => setDrawerOpen(false)}
        />
      </Drawer>

      <Card
        interactive={true}
        elevation={Elevation.TWO}
        className="mb-4 sm:mb-2 last:mb-0"
        onClick={() => setDrawerOpen(true)}
      >
        <div className="flex flex-wrap mb-4 sm:mb-2">
          {/* title */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <H4 className="inline-block pb-1 border-b-2 border-zinc-200 border-solid mb-2">
                {operationDoc.doc.title}
              </H4>
              <Tooltip2
                placement="bottom"
                content={
                  <div className="max-w-sm dark:text-slate-900">
                    下载原 JSON
                  </div>
                }
              >
                <Button
                  small
                  icon="download"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownloadJSON(operationDoc)
                  }}
                />
              </Tooltip2>
              <Tooltip2
                placement="bottom"
                content={
                  <div className="max-w-sm dark:text-slate-900">
                    复制神秘代码
                  </div>
                }
              >
                <Button
                  small
                  icon="clipboard"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCopyShortCode(operation)
                  }}
                />
              </Tooltip2>
            </div>
            <H5 className="flex items-center text-slate-900 -mt-3">
              <EDifficultyLevel
                level={
                  findLevelByStageName(levels, operationDoc.stageName) ||
                  createCustomLevel(operationDoc.stageName)
                }
                difficulty={operationDoc.difficulty}
              />
            </H5>
          </div>

          <div className="lg:flex-1 hidden" />

          {/* meta */}
          <div className="flex flex-col flex-1 gap-y-1.5 gap-x-4">
            <div className="flex flex-wrap sm:justify-end items-center gap-x-4 gap-y-1 text-zinc-500">
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
            </div>
            <div className="text-zinc-500 self-end">
              <Tooltip2 placement="top" content={`作者：${operation.uploader}`}>
                <div>
                  <Icon icon="user" className="mr-1.5" />
                  <span>{operation.uploader}</span>
                </div>
              </Tooltip2>
            </div>
          </div>
        </div>
        <div className="flex md:flex-row flex-col gap-4">
          <div className="text-gray-700 leading-normal md:w-1/2">
            {/* <div className="text-sm text-zinc-600 mb-2 font-bold">作业描述</div> */}
            <Paragraphs
              content={operationDoc.doc.details}
              limitHeight={21 * 13.5} // 13 lines, 21px per line; the extra 0.5 line is intentional so the `mask` effect is obvious
            />
          </div>
          <div className="md:w-1/2">
            <div className="text-sm text-zinc-600 mb-2 font-bold">
              干员/干员组
            </div>
            <OperatorTags operationDoc={operationDoc} />
          </div>
        </div>
      </Card>
    </>
  )
}

const OperatorTags = ({
  operationDoc: { opers, groups },
}: {
  operationDoc: CopilotDocV1.Operation
}) => {
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
