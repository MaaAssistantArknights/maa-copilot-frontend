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
import { OperationListItem } from 'models/operation'

import { useLevels } from '../apis/arknights'
import { CopilotDocV1 } from '../models/copilot.schema'
import { createCustomLevel, findLevelByStageName } from '../models/level'
import { Paragraphs } from './Paragraphs'
import { EDifficultyLevel } from './entity/ELevel'
import { OperationViewer } from './viewer/OperationViewer'

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
        className="mb-2 last:mb-0"
        onClick={() => setDrawerOpen(true)}
      >
        <div className="flex items-start">
          <H4 className="inline-block pb-1 border-b-2 border-zinc-200 border-solid mb-2 mr-2">
            {operationDoc.doc.title}
          </H4>
          <Tooltip2
            placement="bottom"
            content={<div className="max-w-sm">下载原 JSON</div>}
          >
            <Button
              small
              className="mr-2 mb-2 cursor-help"
              icon="download"
              onClick={(e) => {
                e.stopPropagation()
                handleDownloadJSON(operationDoc)
              }}
            />
          </Tooltip2>
          <Tooltip2
            placement="bottom"
            content={<div className="max-w-sm">复制神秘代码</div>}
          >
            <Button
              small
              className="mb-2 cursor-help"
              icon="clipboard"
              onClick={(e) => {
                e.stopPropagation()
                handleCopyShortCode(operation)
              }}
            />
          </Tooltip2>
          <div className="flex-1" />
          <div className="flex flex-col items-end">
            <div className="w-full flex justify-end text-zinc-500">
              <div className="flex items-center mr-4">
                <Icon icon="star" className="mr-1.5" />
                <OperationRating
                  className="text-sm"
                  operation={operation}
                  layout="horizontal"
                />
              </div>

              <Tooltip2
                className="mr-4"
                placement="top"
                content={`访问量：${operation.views}`}
              >
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

            <div className="w-full flex justify-end text-zinc-500 mt-1.5">
              <Tooltip2 placement="top" content={`作者：${operation.uploader}`}>
                <div>
                  <Icon icon="user" className="mr-1.5" />
                  <span>{operation.uploader}</span>
                </div>
              </Tooltip2>
            </div>
          </div>
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
        <div className="flex">
          <div className="text-gray-700 leading-normal w-1/2">
            {/* <div className="text-sm text-zinc-600 mb-2 font-bold">作业描述</div> */}
            <Paragraphs
              content={operationDoc.doc.details}
              limitHeight={21 * 13.5} // 13 lines, 21px per line; the extra 0.5 line is intentional so the `mask` effect is obvious
            />
          </div>
          <div className="w-1/2 ml-4">
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
