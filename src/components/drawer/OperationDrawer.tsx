import { FCC } from "types";

export const OperationDrawer: FCC<{
  title: JSX.Element;
}> = ({ title, children }) => {
  return (
    <section className="flex flex-col relative h-full">
      <div className="px-8 py-2 text-lg font-medium flex items-center bg-slate-100 shadow w-full h-12">
        {title}
      </div>

      {children}
    </section>
  );
};
