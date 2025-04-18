import { Button, Classes, IconSize, MenuItem, Spinner } from '@blueprintjs/core'

import clsx from 'clsx'
import { useAtomValue } from 'jotai'
import { MaaUserInfo } from 'maa-copilot-client'
import { FC, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useUserSearch } from '../apis/user'
import { authAtom } from '../store/auth'
import { formatError } from '../utils/error'
import { useDebouncedQuery } from '../utils/useDebouncedQuery'
import { Select } from './Select'

interface UserFilterProps {
  className?: string
  user?: MaaUserInfo
  onChange: (user: MaaUserInfo | undefined) => void
}

const MYSELF: MaaUserInfo = {
  id: 'me',
  userName: '我自己',
  activated: true,
}

function isMyself(user: MaaUserInfo | undefined) {
  return user?.id === MYSELF.id
}

export const UserFilter: FC<UserFilterProps> = ({
  className,
  user,
  onChange,
}) => {
  const { t } = useTranslation()
  const auth = useAtomValue(authAtom)
  const { query, debouncedQuery, updateQuery, onOptionMouseDown } =
    useDebouncedQuery({ debounceTime: 500 })
  const {
    data: users = [],
    error,
    isLoading,
    isValidating,
  } = useUserSearch({ keyword: debouncedQuery })

  useEffect(() => {
    // 退出登录时清空 myself
    if (isMyself(user) && !auth.token) {
      onChange(undefined)
    }
  }, [auth.token, user, onChange])

  return (
    <>
      <Select<MaaUserInfo>
        className={clsx('items-stretch', className)}
        items={users}
        itemListPredicate={() => (error ? [] : users)} // 有 error 时用 noResults 显示错误信息
        query={query}
        onQueryChange={(query) => updateQuery(query, false)}
        onReset={() => onChange(undefined)}
        itemsEqual={(a, b) => a.id === b.id}
        itemRenderer={(item, { handleClick, handleFocus, modifiers }) => (
          <MenuItem
            roleStructure="listoption"
            className={clsx(modifiers.active && Classes.ACTIVE)}
            key={item.id}
            text={item.userName}
            onClick={handleClick}
            onFocus={handleFocus}
            onMouseDown={onOptionMouseDown}
            selected={item === user}
          />
        )}
        canReset={user && !isMyself(user)}
        onItemSelect={(user) => onChange(user)}
        noResults={
          <MenuItem
            disabled
            text={
              isLoading
                ? t('components.UserFilter.searching')
                : error
                  ? t('components.UserFilter.search_failed') +
                    formatError(error)
                  : query && debouncedQuery
                    ? t('components.UserFilter.no_user_found')
                    : t('components.UserFilter.enter_username')
            }
          />
        }
        inputProps={{
          placeholder: t('components.UserFilter.username_placeholder'),
          leftElement: isValidating ? (
            <Spinner className="m-[7px] mr-[9px]" size={IconSize.STANDARD} />
          ) : undefined,
        }}
        popoverProps={{
          minimal: true,
        }}
      >
        <Button
          minimal
          className="!pl-3 !pr-2"
          icon="person"
          rightIcon="chevron-down"
        >
          {user && !isMyself(user)
            ? user.userName
            : t('components.UserFilter.author')}
        </Button>
      </Select>
      {!!auth.token && (
        <Button
          minimal
          icon="user"
          className="!px-3"
          title={t('components.UserFilter.view_my_jobs')}
          active={isMyself(user)}
          intent={isMyself(user) ? 'primary' : 'none'}
          onClick={() => {
            if (isMyself(user)) {
              onChange(undefined)
            } else {
              onChange(MYSELF)
            }
          }}
        >
          {t('components.UserFilter.view_mine')}
        </Button>
      )}
    </>
  )
}
