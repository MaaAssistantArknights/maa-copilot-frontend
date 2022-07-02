import { H4, Icon, IconName } from "@blueprintjs/core";
import { ReactNode } from "react";

export function CardTitle({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: IconName;
}) {
  return (
    <H4 className="mb-4 text-gray-700 flex items-center">
      {icon && <Icon icon={icon} className="mr-2" size={16} />}
      {children}
    </H4>
  );
}
