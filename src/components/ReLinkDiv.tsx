import { isString } from '@sentry/utils'

import { noop } from 'lodash-es'
import { AnchorHTMLAttributes, HtmlHTMLAttributes } from 'react'
import {
  RelativeRoutingType,
  To,
  useLinkClickHandler,
  useSearchParams,
} from 'react-router-dom'

interface ReLinkProps extends HtmlHTMLAttributes<HTMLDivElement> {
  search?: Record<string, string | number | boolean | undefined>
  target?: AnchorHTMLAttributes<HTMLAnchorElement>['target']

  to?: To
  replace?: boolean
  state?: any
  preventScrollReset?: boolean
  relative?: RelativeRoutingType
}

// div 版的 ReLink
export function ReLinkDiv({
  className,
  search,
  to,
  replace = false,
  state,
  target,
  onClick,
  ...props
}: ReLinkProps) {
  const [searchParams] = useSearchParams()

  if (search) {
    for (const [key, value] of Object.entries(search)) {
      if (value === undefined) {
        searchParams.delete(key)
      } else {
        searchParams.set(key, String(value))
      }
    }
  }

  to = isString(to) ? to : { ...to, search: searchParams.toString() }

  const handleClick = useLinkClickHandler<HTMLDivElement>(to, {
    replace,
    state,
    target,
  })

  return (
    <div
      role="link"
      tabIndex={0}
      className={className}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) {
          handleClick(event)
        }
      }}
      onKeyUp={noop}
      {...props}
    />
  )
}
