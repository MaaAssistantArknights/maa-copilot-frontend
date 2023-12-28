import {
  Button,
  ButtonProps,
  Collapse,
  Divider,
  Drawer,
  H4,
  H6,
  Icon,
} from '@blueprintjs/core'

import { useAtom, useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'

import {
  OPERATORS,
  PROFESSIONS,
  SubProfession,
} from '../../../models/generated/operators'
import { favGroupAtom } from '../../../store/useFavGroups'
import { OperatorAvatar } from './EditorOperator'

interface EditorOperatorSheetProps {}

export const EditorOperatorSheet = () => {
  const { groups: favGroups } = useAtomValue(favGroupAtom)
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
    ],
    [],
  )

  const [selectedProf, setSelectedProf] = useState(formattedProfessions[0])
  const [selectedSubProf, setSelectedSubProf] = useState(defaultSubProf[0])
  const [operatorSheetIsOpen, setOperatorSheetState] = useState(true)
  const formattedSubProfessions = useMemo(
    () => [...defaultSubProf, ...selectedProf.sub],
    [selectedProf],
  )
  const operatorsGroupedByProf = useMemo(() => {
    if (selectedProf.id === 'all') return OPERATORS
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
  return (
    <div className="overflow-y-auto">
      <>
        <Collapse isOpen={operatorSheetIsOpen} keepChildrenMounted>
          <div className="flex flex-row-reverse">
            <div className="flex flex-row-reverse shrink-0 items-stretch pt-3">
              <div className="overflow-y-auto h-screen">
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
              <div className="ml-1 overflow-y-auto h-screen">
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
            <Divider />
            <div className="flex flex-wrap py-5 overflow-y-auto max-h-screen">
              {operatorsGroupedBySubProf.map(({ id, name }) => (
                <div className="w-24" key={id}>
                  <OperatorAvatar id={id} size="large" />
                  <div className="ml-4 flex-grow">
                    <h3 className="font-bold leading-none mb-1">{name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Collapse>
        <div className="flex items-end pl-1">
          <H4 className="p-0 m-0">选择干员</H4>
          <H6
            className="p-0 m-0 ml-1"
            onClick={() => setOperatorSheetState(!operatorSheetIsOpen)}
          >
            {operatorSheetIsOpen ? '收起' : '展开'}
          </H6>
        </div>
        <Divider />
      </>
      <div className="h-screen">2fadkshfkajj22</div>
    </div>
  )
}

export const EditorOperatorSheetTrigger = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Drawer isOpen={open} onClose={() => setOpen(false)}>
        {open && <EditorOperatorSheet />}
      </Drawer>
      <Button onClick={() => setOpen(true)}>快捷编辑</Button>
    </>
  )
}

interface ItemProps extends ButtonProps {
  title: string
}

const ButtonItem = ({ title, icon, ...buttonProps }: ItemProps) => (
  <Button {...buttonProps} className="text-center">
    <Icon icon={icon} />
    <p>{title}</p>
  </Button>
)
