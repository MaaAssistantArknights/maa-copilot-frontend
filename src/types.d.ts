export type WithChildren<T> = T & { children?: React.ReactNode }
export type FCC<T = {}> = React.FC<WithChildren<T>>

export type Cast<T, U> = T extends U ? T : T & U

export type WithTempId<T = {}> = T & { _id?: string }
