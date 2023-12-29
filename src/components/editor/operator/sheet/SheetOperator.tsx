import {
  Button,
  ButtonProps,
  Card,
  CardProps,
  Collapse,
  Divider,
  H4,
  H6,
  Icon,
  NonIdealState,
} from '@blueprintjs/core'

import { useMemo, useState } from 'react'

import {
  OPERATORS,
  OperatorInfo,
  PROFESSIONS,
  SubProfession,
} from 'models/generated/operators'

import { OperatorAvatar } from '../EditorOperator'

interface SheetOperatorProp {}
const SheetOperator = () => {
  const defaultSubProf: SubProfession[] = [
    { id: 'all', name: '全部' },
    { id: 'fav', name: '收藏' },
  ]
  const formattedProfessions = useMemo(
    () => [
      {
        id: 'all',
        name: '全部',
        sub: [],
      },
      ...PROFESSIONS,
      {
        id: 'others',
        name: '其它',
        sub: [],
      },
    ],
    [],
  )

  const [selectedProf, setSelectedProf] = useState(formattedProfessions[0])
  const [selectedSubProf, setSelectedSubProf] = useState(defaultSubProf[0])
  const formattedSubProfessions = useMemo(
    () => [...defaultSubProf, ...selectedProf.sub],
    [selectedProf],
  )
  const operatorsGroupedByProf = useMemo(() => {
    if (selectedProf.id === 'all') return OPERATORS
    if (selectedProf.id === 'others')
      return OPERATORS.filter((item) => item.subProf === 'notchar1')
    return OPERATORS.filter(
      (op) => !!selectedProf.sub.find((item) => item.id === op.subProf),
    )
  }, [selectedProf])

  const operatorsGroupedBySubProf = useMemo(() => {
    if (selectedSubProf.id === 'all') return operatorsGroupedByProf
    else
      return operatorsGroupedByProf.filter(
        (item) => item.subProf === selectedSubProf.id,
      )
  }, [selectedSubProf])

  const checkOperatorState = (target: string) =>
    choosenOperators.find((item) => item.id === target) ? true : false
  const [choosenOperators, setChoosenOperators] = useState<OperatorInfo[]>([])

  return (
    <div className="flex">
      {operatorsGroupedBySubProf.length ? (
        <div className="flex flex-wrap flex-auto py-5 items-start content-start">
          {operatorsGroupedBySubProf.map((item) => (
            <div className="flex items-center w-1/4 mb-1 pl-1">
              <OperatorItem
                selected={checkOperatorState(item.id)}
                onClick={() =>
                  setChoosenOperators([
                    ...choosenOperators,
                    OPERATORS.find((opItem) => opItem.id === item.id)!,
                  ])
                }
                {...item}
              />
            </div>
          ))}
        </div>
      ) : (
        <NonIdealState
          description="暂无相关干员"
          icon="issue"
          title="无"
          className="flex-auto my-auto"
        />
      )}
      <Divider />
      <div className="shrink-0 pt-1">
        <div className="flex flex-row-reverse sticky top-0">
          <div>
            {formattedProfessions.map((prof) => (
              <ButtonItem
                title={prof.name}
                icon="people"
                minimal
                key={prof.id}
                active={prof.id === selectedProf.id}
                onClick={() => {
                  setSelectedProf(prof)
                  setSelectedSubProf(defaultSubProf[0])
                }}
              />
            ))}
          </div>
          <div className="ml-1">
            {formattedSubProfessions?.map((subProf) => (
              <ButtonItem
                title={subProf.name}
                icon="people"
                fill
                key={subProf.id}
                active={subProf.id === selectedSubProf.id}
                minimal
                onClick={() => setSelectedSubProf(subProf)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface SheetOperatorContainerProp extends SheetOperatorProp {}
export const SheetOperatorContainer = ({
  ...SheetOperatorProps
}: SheetOperatorContainerProp) => {
  const [operatorSheetIsOpen, setOperatorSheetState] = useState(true)
  return (
    <div>
      <div className="flex items-center pl-1 mt-1">
        <div className="flex items-center">
          <Icon icon="person" />
          <H4 className="p-0 m-0 ml-1">选择干员</H4>
        </div>
        <H6
          className="p-0 m-0 ml-1 hover:underline cursor-pointer"
          onClick={() => setOperatorSheetState(!operatorSheetIsOpen)}
        >
          {operatorSheetIsOpen ? '收起' : '展开'}
        </H6>
      </div>
      <Divider />
      <Collapse isOpen={operatorSheetIsOpen} keepChildrenMounted>
        <SheetOperator {...SheetOperatorProps} />
      </Collapse>
    </div>
  )
}

interface MenuItemProps extends ButtonProps {
  title: string
}

const ButtonItem = ({ title, icon, ...buttonProps }: MenuItemProps) => (
  <Button {...buttonProps} className="text-center">
    <Icon icon={icon} />
    <p>{title}</p>
  </Button>
)

interface OperatorItemPorps extends CardProps {
  id: string
  name: string
  selected: boolean
}

const OperatorItem = ({
  id,
  selected,
  name,
  ...cardProps
}: OperatorItemPorps) => {
  return (
    <Card
      className={`flex flex-col justify-center items-center w-full p-0 relative cursor-pointer
      ${selected ? 'scale-95' : undefined}`}
      interactive={!selected}
      {...cardProps}
    >
      <OperatorAvatar id={id} size="large" />
      <h3 className="font-bold leading-none text-nowrap text-center mt-3">
        {name}
      </h3>
      {selected && (
        <Icon icon="small-cross" className="absolute right-0 top-0" />
      )}
    </Card>
  )
}
