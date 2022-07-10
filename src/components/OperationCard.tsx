import { Card, Drawer, DrawerSize, Elevation, H4, H5, Icon, Tag } from '@blueprintjs/core';
import { Tooltip2 } from "@blueprintjs/popover2";
import camelcaseKeys from 'camelcase-keys';
import { FC, memo, useState } from 'react';
import { formatDateTime, formatRelativeTime } from "utils/times";
import { Operation } from "../models/operation";
import { OperationViewer } from './viewer/OperationViewer';

export const OperationCard = ({ operation }: { operation: Operation }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <>
      <Drawer size={DrawerSize.LARGE} isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <OperationViewer
          operation={camelcaseKeys(operation) as unknown as CopilotDocV1.Operation}
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
              <Tooltip2
                className="mr-4"
                placement="top"
                content={`访问量：${operation.views} 次`}
              >
                <div>
                  <Icon icon="eye-open" className="mr-1.5" />
                  <span>{operation.views}</span>
                </div>
              </Tooltip2>

              <Tooltip2
                placement="top"
                content={`上传于 ${formatDateTime(operation.uploadTime)}`}
              >
                <div>
                  <Icon icon="time" className="mr-1.5" />
                  <span>{formatRelativeTime(operation.uploadTime)}</span>
                </div>
              </Tooltip2>
            </div>

            <div className="w-full flex justify-end text-zinc-500 mt-1.5">
              <Tooltip2
                placement="top"
                content={`访问量：${operation.views} 次`}
              >
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
            {operation.stageName}
          </Tag>
        </H5>
        <div className="flex">
          <div className="text-gray-700 leading-normal w-1/2">
            <div className="text-sm text-zinc-600 mb-2 font-bold">作业描述</div>
            <Paragraphs content={operation.detail} />
          </div>
          <div className="w-1/2">
            <div className="text-sm text-zinc-600 mb-2 font-bold">使用干员</div>
            <div>
              {operation.operators.map((operator, index) => (
                <Tag key={index} className="mr-2 last:mr-0 mb-1 last:mb-0">
                  {operator}
                </Tag>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

const Paragraphs: FC<{ content: string }> = memo(({ content }) => {
  const paragraphs = content.split("\n").map((el) => el.trim());
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </>
  );
});
