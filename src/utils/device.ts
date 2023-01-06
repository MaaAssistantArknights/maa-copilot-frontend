import { createBreakpoint } from 'react-use'

// https://streamich.github.io/react-use/?path=/story/sensors-createbreakpoint--docs
export type Breakpoint = 'laptopL' | 'laptop' | 'tablet'

export const useBreakpoint = createBreakpoint() as () => Breakpoint
