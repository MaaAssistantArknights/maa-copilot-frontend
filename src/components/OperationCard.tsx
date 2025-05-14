import { Button, Card, Elevation, H4, H5, Icon, Tag } from '@blueprintjs/core'
import { Tooltip2 } from '@blueprintjs/popover2'

import clsx from 'clsx'
import { useAtomValue } from 'jotai'
import { CopilotInfoStatusEnum } from 'maa-copilot-client'
import { copyShortCode, handleLazyDownloadJSON } from 'services/operation'

import { RelativeTime } from 'components/RelativeTime'
import { AddToOperationSetButton } from 'components/operation-set/AddToOperationSet'
import { OperationRating } from 'components/viewer/OperationRating'
import { OpDifficulty, Operation } from 'models/operation'

import { useLevels } from '../apis/level'
import { languageAtom, useTranslation } from '../i18n/i18n'
import { createCustomLevel, findLevelByStageName } from '../models/level'
import { getLocalizedOperatorName } from '../models/operator'
import { Paragraphs } from './Paragraphs'
import { ReLinkDiv } from './ReLinkDiv'
import { UserName } from './UserName'
import { EDifficulty } from './entity/EDifficulty'
import { EDifficultyLevel, NeoELevel } from './entity/ELevel'

export const NeoOperationCard = ({
  operation,
  selected,
  selectable,
  onSelect,
}: {
  operation: Operation
  selectable?: boolean
  selected?: boolean
  onSelect?: (operation: Operation, selected: boolean) => void
}) => {
  const t = useTranslation()
  const { data: levels } = useLevels()

  return (
    <Card interactive={true} elevation={Elevation.TWO} className="relative">
      <ReLinkDiv
        search={{ op: operation.id }}
        className="h-full flex flex-col gap-2"
      >
        <div className="flex">
          <Tooltip2
            content={operation.parsedContent.doc.title}
            className="grow flex-1 whitespace-nowrap overflow-hidden text-ellipsis"
          >
            <H4 className="p-0 m-0 mr-20 flex items-center overflow-hidden">
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                {operation.parsedContent.doc.title}
              </span>
              {operation.status === CopilotInfoStatusEnum.Private && (
                <Tag minimal className="ml-2 shrink-0 font-normal opacity-75">
                  {t.components.OperationCard.private}
                </Tag>
              )}
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
            <div className="text-sm text-zinc-600 dark:text-slate-100 mb-2 font-bold">
              {t.components.OperationCard.operators_and_groups}
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

          <Tooltip2
            placement="top"
            content={t.components.OperationCard.views_count({
              count: operation.views,
            })}
          >
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
            <Icon icon="user" className="mr-1.5" />
            <UserName userId={operation.uploaderId}>
              {operation.uploader}
            </UserName>
          </div>
        </div>
      </ReLinkDiv>

      <CardActions
        className="absolute top-4 right-4"
        operation={operation}
        selectable={selectable}
        selected={selected}
        onSelect={onSelect}
      />
    </Card>
  )
}

export const OperationCard = ({ operation }: { operation: Operation }) => {
  const t = useTranslation()
  const { data: levels } = useLevels()

  return (
    <Card
      interactive={true}
      elevation={Elevation.TWO}
      className="relative mb-4 sm:mb-2 last:mb-0"
    >
      <ReLinkDiv search={{ op: operation.id }}>
        <div className="flex flex-wrap mb-4 sm:mb-2">
          {/* title */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <H4 className="inline-block pb-1 border-b-2 border-zinc-200 border-solid mb-2">
                {operation.parsedContent.doc.title}
                {operation.status === CopilotInfoStatusEnum.Private && (
                  <Tag minimal className="ml-2 font-normal opacity-75">
                    {t.components.OperationCard.private}
                  </Tag>
                )}
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

            <Tooltip2
              placement="top"
              content={t.components.OperationCard.views_count({
                count: operation.views,
              })}
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

            <div>
              <Icon icon="user" className="mr-1.5" />
              <UserName userId={operation.uploaderId}>
                {operation.uploader}
              </UserName>
            </div>
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
            <div className="text-sm text-zinc-600 dark:text-slate-100 mb-2 font-bold">
              {t.components.OperationCard.operators_and_groups}
            </div>
            <OperatorTags operation={operation} />
          </div>
        </div>
      </ReLinkDiv>

      <CardActions
        className="absolute top-4 xl:top-12 right-[18px]"
        operation={operation}
      />
    </Card>
  )
}

const OperatorTags = ({ operation }: { operation: Operation }) => {
  const t = useTranslation()
  const language = useAtomValue(languageAtom)
  const { opers, groups } = operation.parsedContent

  return opers?.length || groups?.length ? (
    <div>
      {opers?.map(({ name, skill }, index) => (
        <Tag key={index} className="mr-2 last:mr-0 mb-1 last:mb-0">
          {`${getLocalizedOperatorName(name, language)} ${skill ?? 1}`}
        </Tag>
      ))}
      {groups?.map(({ name, opers }, index) => (
        <Tooltip2
          key={index}
          className="mr-2 last:mr-0 mb-1 last:mb-0"
          placement="top"
          content={
            opers
              ?.map(
                ({ name, skill }) =>
                  `${getLocalizedOperatorName(name, language)} ${skill ?? 1}`,
              )
              .join(', ') || t.components.OperationCard.no_operators
          }
        >
          <Tag>[{name}]</Tag>
        </Tooltip2>
      ))}
    </div>
  ) : (
    <div className="text-gray-500">{t.components.OperationCard.no_records}</div>
  )
}

const CardActions = ({
  className,
  operation,
  selected,
  selectable,
  onSelect,
}: {
  className?: string
  operation: Operation
  selectable?: boolean
  selected?: boolean
  onSelect?: (operation: Operation, selected: boolean) => void
}) => {
  const t = useTranslation()
  return selectable ? (
    <Button
      small
      minimal={!selected}
      outlined={!selected}
      intent="primary"
      className="absolute top-4 right-4"
      icon={selected ? 'tick' : 'blank'}
      onClick={() => onSelect?.(operation, !selected)}
    />
  ) : (
    <div className={clsx('flex gap-1', className)}>
      <Tooltip2
        placement="bottom"
        content={
          <div className="max-w-sm dark:text-slate-900">
            {t.components.OperationCard.download_json}
          </div>
        }
      >
        <Button
          small
          icon="download"
          onClick={() =>
            handleLazyDownloadJSON(
              operation.id,
              operation.parsedContent.doc.title,
            )
          }
        />
      </Tooltip2>
      <Tooltip2
        placement="bottom"
        content={
          <div className="max-w-sm dark:text-slate-900">
            {t.components.OperationCard.copy_secret_code}
          </div>
        }
      >
        <Button
          small
          icon="clipboard"
          onClick={() => copyShortCode(operation)}
        />
      </Tooltip2>
      <Tooltip2
        placement="bottom"
        content={
          <div className="max-w-sm dark:text-slate-900">
            {t.components.OperationCard.add_to_job_set}
          </div>
        }
      >
        <AddToOperationSetButton
          small
          icon="plus"
          operationIds={[operation.id]}
        />
      </Tooltip2>
    </div>
  )
}
