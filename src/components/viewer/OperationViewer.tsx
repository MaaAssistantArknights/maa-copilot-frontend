import {
  Button,
  ButtonGroup,
  Card,
  Collapse,
  Elevation,
  H3,
  H4,
  H6,
  Icon,
  Menu,
  MenuDivider,
  MenuItem,
  NonIdealState,
  Tag,
} from '@blueprintjs/core'
import { Popover2, Tooltip2 } from '@blueprintjs/popover2'
import { ErrorBoundary } from '@sentry/react'

import {
  banComments,
  deleteOperation,
  rateOperation,
  useOperation,
  useRefreshOperations,
} from 'apis/operation'
import clsx from 'clsx'
import { useAtom } from 'jotai'
import {
  BanCommentsStatusEnum,
  CopilotInfoStatusEnum,
} from 'maa-copilot-client'
import { ComponentType, FC, useEffect, useState } from 'react'
import { copyShortCode, handleDownloadJSON } from 'services/operation'

import { FactItem } from 'components/FactItem'
import { Paragraphs } from 'components/Paragraphs'
import { RelativeTime } from 'components/RelativeTime'
import { withSuspensable } from 'components/Suspensable'
import { AppToaster } from 'components/Toaster'
import { DrawerLayout } from 'components/drawer/DrawerLayout'
import { OperatorAvatar } from 'components/editor/operator/EditorOperator'
import { EDifficultyLevel } from 'components/entity/ELevel'
import { OperationRating } from 'components/viewer/OperationRating'
import { OpRatingType, Operation } from 'models/operation'
import { authAtom } from 'store/auth'
import { wrapErrorMessage } from 'utils/wrapErrorMessage'

import { useLevels } from '../../apis/level'
import { i18nDefer, useTranslation } from '../../i18n/i18n'
import { CopilotDocV1 } from '../../models/copilot.schema'
import { createCustomLevel, findLevelByStageName } from '../../models/level'
import { Level } from '../../models/operation'
import {
  OPERATORS,
  defaultSkills,
  getEliteIconUrl,
  useLocalizedOperatorName,
  withDefaultRequirements,
} from '../../models/operator'
import { formatError } from '../../utils/error'
import { ActionCard } from '../ActionCard'
import { Confirm } from '../Confirm'
import { MasteryIcon } from '../MasteryIcon'
import { ReLink } from '../ReLink'
import { UserName } from '../UserName'
import { CommentArea } from './comment/CommentArea'

const ManageMenu: FC<{
  operation: Operation
  onRevalidateOperation: () => void
  onDelete: () => void
}> = ({ operation, onRevalidateOperation, onDelete }) => {
  const t = useTranslation()
  const refreshOperations = useRefreshOperations()

  const handleBanComments = async (status: BanCommentsStatusEnum) => {
    await wrapErrorMessage(
      (e) =>
        t.components.viewer.OperationViewer.operation_failed({
          error: formatError(e),
        }),
      banComments({ operationId: operation.id, status }),
    ).catch(console.warn)

    onRevalidateOperation()
  }

  const handleDelete = async () => {
    try {
      await wrapErrorMessage(
        (e) =>
          t.components.viewer.OperationViewer.delete_failed({
            error: formatError(e),
          }),
        deleteOperation({ id: operation.id }),
      )

      refreshOperations()

      AppToaster.show({
        intent: 'success',
        message: t.components.viewer.OperationViewer.delete_success,
      })
      onDelete()
    } catch (e) {
      console.warn(e)
    }
  }

  return (
    <>
      <Menu>
        <li>
          <ReLink
            className="hover:text-inherit hover:no-underline"
            to={`/create/${operation.id}`}
            target="_blank"
          >
            <MenuItem
              tagName="div"
              icon="edit"
              text={t.components.viewer.OperationViewer.modify_task}
            />
          </ReLink>
        </li>
        <li>
          <ReLink
            className="hover:text-inherit hover:no-underline"
            to={`/editor/${operation.id}`}
            target="_blank"
          >
            <MenuItem
              tagName="div"
              icon="edit"
              text={t.components.viewer.OperationViewer.modify_task_v2}
            />
          </ReLink>
        </li>
        {operation.commentStatus === BanCommentsStatusEnum.Enabled && (
          <Confirm
            intent="danger"
            trigger={({ handleClick }) => (
              <MenuItem
                icon="comment"
                text={t.components.viewer.OperationViewer.close_comments}
                shouldDismissPopover={false}
                onClick={handleClick}
              />
            )}
            onConfirm={() => handleBanComments(BanCommentsStatusEnum.Disabled)}
          >
            <H6>{t.components.viewer.OperationViewer.close_comments}</H6>
            <p>{t.components.viewer.OperationViewer.confirm_close_comments}</p>
            <p>
              {t.components.viewer.OperationViewer.existing_comments_preserved}
            </p>
          </Confirm>
        )}
        {operation.commentStatus === BanCommentsStatusEnum.Disabled && (
          <Confirm
            trigger={({ handleClick }) => (
              <MenuItem
                icon="comment"
                text={t.components.viewer.OperationViewer.open_comments}
                shouldDismissPopover={false}
                onClick={handleClick}
              />
            )}
            onConfirm={() => handleBanComments(BanCommentsStatusEnum.Enabled)}
          >
            <H6>{t.components.viewer.OperationViewer.open_comments}</H6>
            <p>{t.components.viewer.OperationViewer.confirm_open_comments}</p>
          </Confirm>
        )}
        <MenuDivider />
        <Confirm
          intent="danger"
          confirmButtonText={t.components.viewer.OperationViewer.delete}
          repeats={3}
          onConfirm={handleDelete}
          trigger={({ handleClick }) => (
            <MenuItem
              icon="delete"
              intent="danger"
              text={t.components.viewer.OperationViewer.delete_task}
              shouldDismissPopover={false}
              onClick={handleClick}
            />
          )}
        >
          <H4>{t.components.viewer.OperationViewer.delete_task}</H4>
          <p>{t.components.viewer.OperationViewer.confirm_delete_task}</p>
          <p>{t.components.viewer.OperationViewer.three_confirmations}</p>
        </Confirm>
      </Menu>
    </>
  )
}

export const OperationViewer: ComponentType<{
  operationId: Operation['id']
  onCloseDrawer: () => void
}> = withSuspensable(
  function OperationViewer({ operationId, onCloseDrawer }) {
    const t = useTranslation()
    const {
      data: operation,
      error,
      mutate,
    } = useOperation({
      id: operationId,
      suspense: true,
    })

    useEffect(() => {
      // on finished loading, scroll to #fragment if any
      if (operation) {
        const fragment = window.location.hash
        if (fragment) {
          const el = document.querySelector(fragment)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' })
          }
        }
      }
    }, [operation])

    const { data: levels } = useLevels()

    const [auth] = useAtom(authAtom)

    // make eslint happy: we got Suspense out there
    if (!operation) throw new Error('unreachable')

    useEffect(() => {
      if (error) {
        AppToaster.show({
          intent: 'danger',
          message: t.components.viewer.OperationViewer.refresh_failed({
            error: formatError(error),
          }),
        })
      }
    }, [error, t])

    const handleRating = async (decision: OpRatingType) => {
      // cancel rating if already rated by the same type
      if (decision === operation.ratingType) {
        decision = OpRatingType.None
      }

      wrapErrorMessage(
        (e) =>
          t.components.viewer.OperationViewer.submit_rating_failed({
            error: formatError(e),
          }),
        mutate(async (val) => {
          await rateOperation({
            id: operationId,
            rating: decision,
          })
          return val
        }),
      ).catch(console.warn)
    }

    return (
      <DrawerLayout
        title={
          <>
            <Icon icon="document" />
            <span className="ml-2">
              {t.components.viewer.OperationViewer.maa_copilot_task}
            </span>

            <div className="flex-1" />

            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              {operation.uploaderId === auth.userId && (
                <Popover2
                  content={
                    <ManageMenu
                      operation={operation}
                      onRevalidateOperation={() => mutate()}
                      onDelete={() => onCloseDrawer()}
                    />
                  }
                >
                  <Button
                    icon="wrench"
                    text={t.components.viewer.OperationViewer.manage}
                    rightIcon="caret-down"
                  />
                </Popover2>
              )}

              <Button
                icon="download"
                text={t.components.viewer.OperationViewer.download_json}
                onClick={() => handleDownloadJSON(operation.parsedContent)}
              />

              <Button
                icon="clipboard"
                text={t.components.viewer.OperationViewer.copy_secret_code}
                intent="primary"
                onClick={() => copyShortCode(operation)}
              />
            </div>
          </>
        }
      >
        <ErrorBoundary
          fallback={
            <NonIdealState
              icon="issue"
              title={t.components.viewer.OperationViewer.render_error}
              description={t.components.viewer.OperationViewer.render_problem}
            />
          }
        >
          <OperationViewerInner
            levels={levels}
            operation={operation}
            handleRating={handleRating}
          />
        </ErrorBoundary>
      </DrawerLayout>
    )
  },
  {
    pendingTitle: i18nDefer.components.viewer.OperationViewer.loading_task,
  },
)

const OperatorCard: FC<{
  operator: CopilotDocV1.Operator
  version?: number
}> = ({ operator, version = 1 }) => {
  const t = useTranslation()
  const displayName = useLocalizedOperatorName(operator.name)
  const info = OPERATORS.find((o) => o.name === operator.name)
  const skills = info ? info.skills : defaultSkills
  const { level, elite, skillLevel, module } = withDefaultRequirements(
    operator.requirements,
    info?.rarity,
  )

  return (
    <div className="relative flex items-start">
      <div className="relative w-20">
        <div className="relative rounded-lg overflow-hidden shadow-md">
          <OperatorAvatar
            id={info?.id}
            rarity={info?.rarity}
            className="w-20 h-20"
            fallback={displayName}
          />
          {info?.equips && module !== 0 && (
            <div
              title={t.components.editor2.label.opers.requirements.module}
              className="absolute -bottom-1 right-1 font-serif font-bold text-lg text-white [text-shadow:0_0_3px_#a855f7,0_0_5px_#a855f7]"
            >
              {info.equips[module]}
            </div>
          )}
        </div>
        <h4 className="mt-1 -mx-2 font-semibold tracking-tighter text-center">
          {displayName}
        </h4>
        {info && info.prof !== 'TOKEN' && (
          <img
            className="absolute top-0 right-0 w-5 h-5 p-px bg-gray-600 rounded-tr-md"
            src={'/assets/prof-icons/' + info.prof + '.png'}
            alt={info.prof}
          />
        )}
      </div>
      {version >= 2 && info?.prof !== 'TOKEN' && (
        <>
          <div className="absolute top-1 -left-5 ml-[2px] px-3 py-4 rounded-full bg-[radial-gradient(rgba(0,0,0,0.6)_10%,rgba(0,0,0,0.08)_30%,rgba(0,0,0,0)_45%)] pointer-events-none">
            <img
              className="w-7 h-6 object-contain"
              src={getEliteIconUrl(elite)}
              alt={t.models.operator.elite({ level: elite })}
            />
          </div>
          <div className="absolute -top-2 -left-2 w-8 h-8 pr-px leading-7 rounded-full border-2 border-yellow-300 bg-black/50 text-lg text-white font-semibold text-center shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            {level}
          </div>
        </>
      )}

      <ul className="flex flex-col gap-1 ml-1">
        {skills.map((_, index) => {
          const skillNumber = index + 1
          const selected = operator.skill === skillNumber
          return (
            <li
              key={index}
              className={clsx(
                'relative',
                selected
                  ? 'bg-purple-100 dark:bg-purple-900 dark:text-purple-200 text-purple-800'
                  : 'bg-gray-300 dark:bg-gray-600 opacity-15 dark:opacity-25',
              )}
              title={t.models.operator.skill_number({ count: skillNumber })}
            >
              <div className="w-6 h-6 flex items-center justify-center font-bold text-xl border-2 border-current">
                {version >= 2 ? (
                  selected ? (
                    skillLevel <= 7 ? (
                      skillLevel
                    ) : (
                      <MasteryIcon
                        className="w-4 h-4"
                        mastery={skillLevel - 7}
                        subClassName="fill-gray-300 dark:fill-gray-500"
                      />
                    )
                  ) : undefined
                ) : (
                  skillNumber
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function OperationViewerInner({
  levels,
  operation,
  handleRating,
}: {
  levels: Level[]
  operation: Operation
  handleRating: (decision: OpRatingType) => Promise<void>
}) {
  const t = useTranslation()
  return (
    <div className="h-full overflow-auto p-4 md:p-8">
      <H3>
        {operation.parsedContent.doc.title}
        {operation.status === CopilotInfoStatusEnum.Private && (
          <Tag minimal className="ml-2 font-normal opacity-75">
            {t.components.viewer.OperationViewer.private}
          </Tag>
        )}
      </H3>

      <div className="flex flex-col-reverse md:grid grid-rows-1 grid-cols-3 gap-2 md:gap-8">
        <div className="flex flex-col">
          <Paragraphs content={operation.parsedContent.doc.details} linkify />
        </div>

        <div className="flex flex-col">
          <FactItem title={t.components.viewer.OperationViewer.stage}>
            <EDifficultyLevel
              level={
                findLevelByStageName(
                  levels,
                  operation.parsedContent.stageName,
                ) || createCustomLevel(operation.parsedContent.stageName)
              }
              difficulty={operation.parsedContent.difficulty}
            />
          </FactItem>

          <FactItem
            relaxed
            className="items-start"
            title={t.components.viewer.OperationViewer.task_rating}
          >
            <OperationRating operation={operation} className="mr-2" />

            <ButtonGroup className="flex items-center ml-2">
              <Tooltip2 content="o(*≧▽≦)ツ" placement="bottom">
                <Button
                  icon="thumbs-up"
                  intent={
                    operation.ratingType === OpRatingType.Like
                      ? 'success'
                      : 'none'
                  }
                  className="mr-2"
                  active={operation.ratingType === OpRatingType.Like}
                  onClick={() => handleRating(OpRatingType.Like)}
                />
              </Tooltip2>
              <Tooltip2 content=" ヽ(。>д<)ｐ" placement="bottom">
                <Button
                  icon="thumbs-down"
                  intent={
                    operation.ratingType === OpRatingType.Dislike
                      ? 'danger'
                      : 'none'
                  }
                  active={operation.ratingType === OpRatingType.Dislike}
                  onClick={() => handleRating(OpRatingType.Dislike)}
                />
              </Tooltip2>
            </ButtonGroup>
          </FactItem>
        </div>

        <div className="flex flex-wrap md:flex-col items-start select-none tabular-nums gap-4">
          <FactItem
            dense
            title={t.components.viewer.OperationViewer.views}
            icon="eye-open"
          >
            <span className="text-gray-800 dark:text-slate-100 font-bold">
              {operation.views}
            </span>
          </FactItem>

          <FactItem
            dense
            title={t.components.viewer.OperationViewer.published_at}
            icon="time"
          >
            <span className="text-gray-800 dark:text-slate-100 font-bold">
              <RelativeTime moment={operation.uploadTime} />
            </span>
          </FactItem>

          <FactItem
            dense
            title={t.components.viewer.OperationViewer.author}
            icon="user"
          >
            <UserName
              className="text-gray-800 dark:text-slate-100 font-bold"
              userId={operation.uploaderId}
            >
              {operation.uploader}
            </UserName>
          </FactItem>
        </div>
      </div>

      <div className="h-[1px] w-full bg-gray-200 mt-4 mb-6" />

      <ErrorBoundary
        fallback={
          <NonIdealState
            icon="issue"
            title={t.components.viewer.OperationViewer.render_error}
            description={
              t.components.viewer.OperationViewer.render_preview_problem
            }
            className="h-96 bg-stripe rounded"
          />
        }
      >
        <OperationViewerInnerDetails operation={operation} />
      </ErrorBoundary>

      <div className="h-[1px] w-full bg-gray-200 mt-4 mb-6" />

      <div className="mb-6">
        <H4 className="mb-4" id="comment">
          {operation.commentStatus === BanCommentsStatusEnum.Disabled
            ? t.components.viewer.OperationViewer.comments
            : t.components.viewer.OperationViewer.comments_count({
                count: operation.commentsCount,
              })}
        </H4>
        {operation.commentStatus === BanCommentsStatusEnum.Disabled ? (
          <NonIdealState
            icon="tree"
            title={t.components.viewer.OperationViewer.comments_closed}
            description={t.components.viewer.OperationViewer.feel_the_silence}
          />
        ) : (
          <CommentArea operationId={operation.id} />
        )}
      </div>
    </div>
  )
}
function OperationViewerInnerDetails({ operation }: { operation: Operation }) {
  const t = useTranslation()
  const [showOperators, setShowOperators] = useState(true)
  const [showActions, setShowActions] = useState(false)

  return (
    <div>
      <H4
        className="inline-flex items-center cursor-pointer hover:text-violet-500"
        onClick={() => setShowOperators((v) => !v)}
      >
        {t.components.viewer.OperationViewer.operators_and_groups}
        <Tooltip2
          className="!flex items-center"
          placement="top"
          content={t.components.viewer.OperationViewer.operator_group_tooltip}
        >
          <Icon icon="info-sign" size={12} className="text-zinc-500 ml-1" />
        </Tooltip2>
        <Icon
          icon="chevron-down"
          className={clsx(
            'ml-1 transition-transform',
            showOperators && 'rotate-180',
          )}
        />
      </H4>
      <Collapse isOpen={showOperators}>
        <div className="mt-2 flex flex-wrap gap-6">
          {!operation.parsedContent.opers?.length &&
            !operation.parsedContent.groups?.length && (
              <NonIdealState
                className="my-2"
                title={t.components.viewer.OperationViewer.no_operators}
                description={
                  t.components.viewer.OperationViewer.no_operators_added
                }
                icon="slash"
                layout="horizontal"
              />
            )}
          {operation.parsedContent.opers?.map((operator) => (
            <OperatorCard
              key={operator.name}
              operator={operator}
              version={operation.parsedContent.version}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
          {operation.parsedContent.groups?.map((group) => (
            <Card
              elevation={Elevation.ONE}
              className="!p-2 flex flex-col items-center"
              key={group.name}
            >
              <H6 className="mb-3 text-gray-800">{group.name}</H6>
              <div className="flex flex-wrap px-2 gap-6">
                {group.opers
                  ?.filter(Boolean)
                  .map((operator) => (
                    <OperatorCard
                      key={operator.name}
                      operator={operator}
                      version={operation.parsedContent.version}
                    />
                  ))}

                {group.opers?.filter(Boolean).length === 0 && (
                  <span className="text-zinc-500">
                    {t.components.viewer.OperationViewer.no_operator}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </Collapse>

      <H4
        className="mt-6 inline-flex items-center cursor-pointer hover:text-violet-500"
        onClick={() => setShowActions((v) => !v)}
      >
        {t.components.viewer.OperationViewer.action_sequence}
        <Icon
          icon="chevron-down"
          className={clsx(
            'ml-1 transition-transform',
            showActions && 'rotate-180',
          )}
        />
      </H4>
      <Collapse isOpen={showActions}>
        {operation.parsedContent.actions?.length ? (
          <div className="mt-2 flex flex-col pb-8">
            {operation.parsedContent.actions.map((action, i) => (
              <ActionCard action={action} key={i} />
            ))}
          </div>
        ) : (
          <NonIdealState
            className="my-2"
            title={t.components.viewer.OperationViewer.no_actions}
            description={t.components.viewer.OperationViewer.no_actions_defined}
            icon="slash"
            layout="horizontal"
          />
        )}
      </Collapse>
    </div>
  )
}
