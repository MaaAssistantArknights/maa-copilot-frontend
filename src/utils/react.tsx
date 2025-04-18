import { WritableAtom } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { Fragment, ReactNode } from 'react'

export function joinJSX(elements: ReactNode[], separator: ReactNode) {
  return elements.reduce((acc: ReactNode[], element, index) => {
    if (index === 0) return [element]
    return [
      ...acc,
      <Fragment key={'sep' + index}>{separator}</Fragment>,
      element,
    ]
  }, [])
}

// https://jotai.org/docs/guides/initialize-atom-on-render#using-typescript
export function AtomsHydrator({
  atomValues,
  children,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  atomValues: Iterable<
    readonly [WritableAtom<unknown, [any], unknown>, unknown]
  >
  children: ReactNode
}) {
  useHydrateAtoms(new Map(atomValues))
  return children as JSX.Element
}
