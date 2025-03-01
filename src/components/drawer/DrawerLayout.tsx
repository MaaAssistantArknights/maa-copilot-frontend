import { FCC } from 'types'

export const DrawerLayout: FCC<{
  title: JSX.Element
}> = ({ title, children }) => {
  return (
    <section className="flex flex-col relative h-full">
      <div className="px-4 md:px-8 py-2 text-lg font-medium flex flex-wrap items-center bg-slate-100 shadow w-full min-h-12 dark:bg-slate-900 dark:text-white">
        {title}
      </div>

      {children}
    </section>
  )
}
