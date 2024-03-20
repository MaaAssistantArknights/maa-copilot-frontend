import { isString } from '@sentry/utils'

import clsx from 'clsx'
import { Link, LinkProps, useSearchParams } from 'react-router-dom'
import { SetOptional } from 'type-fest'

interface ReLinkProps extends SetOptional<LinkProps, 'to'> {
  search?: Record<string, string | number | boolean | undefined>
}

// ReLink = Refined Link. Or whatever you think it to be.
export function ReLink({ className, search, ...props }: ReLinkProps) {
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

  return (
    <Link
      {...props}
      className={clsx('hover:no-underline hover:text-inherit', className)}
      to={
        isString(props.to)
          ? props.to
          : { ...props.to, search: searchParams.toString() }
      }
    />
  )
}
