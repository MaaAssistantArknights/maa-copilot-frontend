import {
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
import { RelativeTime } from 'components/RelativeTime'
import { OperationRating } from 'components/viewer/OperationRating'
import { OperationListItem } from 'models/operation'
import { useState } from 'react'
import { EDifficultyLevel } from './entity/ELevel'
import { Paragraphs } from './Paragraphs'
import { OperationViewer } from './viewer/OperationViewer'

const formatOperatorTag = (operator: string) => {
  const splitted = operator.split('::')
  return splitted.length > 1 ? `${splitted[0]} ${splitted[1]}` : operator
}

export const OperationCard = ({
  operation,
}: {
  operation: OperationListItem
}) => {
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
          <H4 className="inline-block pb-1 border-b-2 border-zinc-200 border-solid mb-2">
            {operation.title}
          </H4>
          <div className="flex-1"></div>
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
          <div className="text-sm text-zinc-600 mr-2">作战</div>
          <Tag
            className="bg-slate-100 text-slate-900 border border-slate-300 border-solid"
            large
          >
            <EDifficultyLevel
              level={operation.level}
              difficulty={operation.difficulty}
            />
          </Tag>
        </H5>
        <div className="flex">
          <div className="text-gray-700 leading-normal w-1/2">
            <div className="text-sm text-zinc-600 mb-2 font-bold">作业描述</div>
            <Paragraphs content={operation.detail} linkify />
          </div>
          <div className="w-1/2 ml-4">
            <div className="text-sm text-zinc-600 mb-2 font-bold">
              使用干员与技能
            </div>
            <div>
              {operation.operators.map((operator, index) => (
                <Tag key={index} className="mr-2 last:mr-0 mb-1 last:mb-0">
                  {formatOperatorTag(operator)}
                </Tag>
              ))}
              {operation.operators.length === 0 && (
                <span className="text-gray-500">无记录</span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </>
  )
}
