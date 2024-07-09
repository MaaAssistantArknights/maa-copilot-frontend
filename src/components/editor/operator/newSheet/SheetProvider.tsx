import React, {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from 'react'

import { EditorPerformerAddProps } from '../EditorPerformerAdd'

type SubmitFuncParent = EditorPerformerAddProps

export interface OperatorInSheet {}

export interface SheetProviderProp {
  submitOperator: SubmitFuncParent['submitOperator']
  submitGroup: SubmitFuncParent['submitGroup']
  children: ReactNode
}

interface SheetContextValue {
  useOperatorInSheet: [any, Dispatch<SetStateAction<any>>]
  useGroupInSheet: [any, Dispatch<SetStateAction<any>>]
}

const SheetContext = createContext<Partial<SheetContextValue>>({})

export const SheetProvider: FC<SheetProviderProp> = ({
  children,
  submitOperator,
  submitGroup,
}) => {
  const useOperatorInSheet = useState([])
  const useGroupInSheet = useState([])

  return (
    <SheetContext.Provider value={{ useOperatorInSheet, useGroupInSheet }}>
      {children}
    </SheetContext.Provider>
  )
}
