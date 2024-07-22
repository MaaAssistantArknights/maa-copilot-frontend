import { FC, ReactNode, createContext, useContext } from 'react'
import { UseFieldArrayRemove } from 'react-hook-form'

import { EditorPerformerGroupProps } from '../EditorPerformerGroup'
import { EditorPerformerOperatorProps } from '../EditorPerformerOperator'
import { Group, Operator } from '../EditorSheet'

export interface SheetProviderProp {
  submitOperator: EditorPerformerOperatorProps['submit']
  existedOperators: Operator[]
  existedGroups: Group[]
  removeOperator: UseFieldArrayRemove
  submitGroup: EditorPerformerGroupProps['submit']
  removeGroup: UseFieldArrayRemove
  children: ReactNode
}

export type SheetContextValue = Omit<SheetProviderProp, 'children'>

const SheetContext = createContext<SheetContextValue>({} as SheetContextValue)

export const SheetProvider: FC<SheetProviderProp> = ({
  children,
  ...providerValue
}) => (
  <SheetContext.Provider value={{ ...providerValue }}>
    {children}
  </SheetContext.Provider>
)

export const useSheet = () => useContext(SheetContext)
