import { MenuItem, Spinner } from '@blueprintjs/core'

import clsx from 'clsx'
import { MaaUserInfo } from 'maa-copilot-client'
import { FC, useState } from 'react'

import { useUserSearch } from '../apis/user'
import { formatError } from '../utils/error'
import { Suggest } from './Suggest'

interface UserFilterProps {
  className?: string
  user?: MaaUserInfo
  onChange: (user: MaaUserInfo | undefined) => void
}

export const UserFilter: FC<UserFilterProps> = ({
  className,
  user,
  onChange,
}) => {
  const [keyword, setKeyword] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const {
    data: users = [],
    error,
    isLoading,
    isValidating,
  } = useUserSearch({
    // 如果已经选中了用户，就不再搜索
    keyword: debouncedKeyword === user?.userName ? undefined : debouncedKeyword,
  })

  return (
    <Suggest<MaaUserInfo>
      debounce={500}
      items={users}
      itemListPredicate={() => (error ? [] : users)} // 有 error 时用 noResults 显示错误信息
      query={keyword}
      onQueryChange={setKeyword}
      onDebouncedQueryChange={setDebouncedKeyword}
      onReset={() => onChange(undefined)}
      className={clsx(className, user && '[&_input:not(:focus)]:italic')}
      itemRenderer={(item, { handleClick, handleFocus, modifiers }) => (
        <MenuItem
          key={item.id}
          text={item.userName}
          onClick={handleClick}
          onFocus={handleFocus}
          selected={modifiers.active}
          disabled={modifiers.disabled}
        />
      )}
      selectedItem={user ?? null}
      onItemSelect={(user) => onChange(user)}
      inputValueRenderer={(item) => item.userName}
      noResults={
        <MenuItem
          disabled
          text={
            isLoading
              ? '正在搜索...'
              : error
                ? '搜索失败：' + formatError(error)
                : keyword && debouncedKeyword
                  ? '查无此人 (ﾟДﾟ≡ﾟдﾟ)!?'
                  : '输入用户名以搜索'
          }
        />
      }
      inputProps={{
        placeholder: '上传者',
        leftIcon: isValidating ? (
          <Spinner className="bp4-icon" size={16} />
        ) : (
          'person'
        ),
        large: true,
        size: 64,
      }}
    />
  )
}
