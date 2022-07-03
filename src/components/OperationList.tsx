import { Button } from "@blueprintjs/core";
import { FC } from "react";
import { useOperations } from "../apis/query";
import { OperationCard } from "./OperationCard";
import { withSuspensable } from "./Suspensable";

export const OperationList: FC = withSuspensable(() => {
  const { operations, size, setSize, isValidating } = useOperations();
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
