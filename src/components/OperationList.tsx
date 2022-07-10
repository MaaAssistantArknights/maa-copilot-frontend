import { Button } from "@blueprintjs/core";
import { OrderBy, useOperations } from "apis/query";
import { ComponentType } from "react";
import { OperationCard } from "./OperationCard";
import { withSuspensable } from "./Suspensable";

export const OperationList: ComponentType<{
  orderBy: OrderBy;
}> = withSuspensable(({ orderBy }) => {
  const { operations, size, setSize, isValidating } = useOperations(orderBy);
  return (
    <>
      {operations?.map((operation) => (
        <OperationCard operation={operation} key={operation.id} />
      ))}

      <Button
        loading={isValidating}
        text="加载更多"
        icon="more"
        className="mt-2"
        large
        fill
        onClick={() => setSize(size + 1)}
      />
    </>
  );
});
