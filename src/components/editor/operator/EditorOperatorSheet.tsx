import { Button, Drawer } from '@blueprintjs/core'

import { useAtom, useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'

import { OPERATORS, PROFESSIONS } from '../../../models/generated/operators'
import { favGroupAtom } from '../../../store/useFavGroups'
import { OperatorAvatar } from './EditorOperator'

interface EditorOperatorSheetProps {}

export const EditorOperatorSheet = () => {
  const { groups: favGroups } = useAtomValue(favGroupAtom)
  const professions = useMemo(
    () => [{ id: 'fav', name: '常用' }, ...PROFESSIONS],
    [],
  )

  const [selectedProf, setSelectedProf] = useState(PROFESSIONS[0])
  const [selectedSubProf, setSelectedSubProf] = useState(PROFESSIONS[0]?.sub[0])

  const operators = useMemo(
    () => OPERATORS.filter((op) => op.subProf === selectedSubProf.id),
    [selectedSubProf],
  )

  return (
    <div>
      <div className="flex flex-wrap">
        {PROFESSIONS.map((prof) => (
          <Button
            large
            key={prof.id}
            active={prof === selectedProf}
            onClick={() => {
              setSelectedProf(prof)
              setSelectedSubProf(prof.sub[0])
            }}
          >
            {prof.name}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap">
        {selectedProf?.sub.map((subProf) => (
          <Button
            large
            key={subProf.id}
            active={subProf === selectedSubProf}
            onClick={() => setSelectedSubProf(subProf)}
          >
            {subProf.name}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap">
        {operators.map(({ id, name }) => (
          <div className="w-24" key={id}>
            <OperatorAvatar id={id} size="large" />
            <div className="ml-4 flex-grow">
              <h3 className="font-bold leading-none mb-1">{name}</h3>
            </div>
          </div>
        ))}
      </div>
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
      <Button onClick={() => setOpen(true)}>选择干员</Button>
    </>
  )
}
