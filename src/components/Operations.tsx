import { Button, ButtonGroup, Card, FormGroup, Tag } from '@blueprintjs/core'
import { Suggest2 } from '@blueprintjs/select'
import { CardTitle } from 'components/CardTitle'
import { OperationList } from 'components/OperationList'
import { FC, useState } from 'react'
import { OrderBy } from '../apis/query'
import { withSuspensable } from './Suspensable'

export const Operations: FC = withSuspensable(() => {
  const [orderBy, setOrderBy] = useState<OrderBy>('rating')

  return (
    <>
      <Card className="flex flex-col mb-4">
        <CardTitle className="mb-4" icon="properties">
          查找作业
        </CardTitle>
        <FormGroup label="搜索" helperText="键入关卡名" className="mt-2">
          <Suggest2
            className="w-1/3"
            inputProps={{
              placeholder: '搜索...',
              leftIcon: 'search',
              size: 64,
              large: true,
              enterKeyHint: 'search',
              // rightElement: <Spinner size={18} />,
            }}
            items={[]}
          />
        </FormGroup>
        <FormGroup label="排序">
          <ButtonGroup
            on={(e) => {
              setOrderBy(e as OrderBy)
            }}
          >
            <Button
              icon="thumbs-up"
              active={orderBy === 'rating'}
              onClick={() => {
                setOrderBy('rating')
              }}
            >
              <span className="flex items-center">
                好评率
                <Tag minimal className="ml-1">
                  默认
                </Tag>
              </span>
            </Button>
            <Button
              icon="eye-open"
              active={orderBy === 'views'}
              onClick={() => {
                setOrderBy('views')
              }}
            >
              访问量
            </Button>
          </ButtonGroup>
        </FormGroup>
      </Card>

      <OperationList orderBy={orderBy} />
    </>
  )
})
