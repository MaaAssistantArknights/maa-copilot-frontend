import { FC } from "react";
import { useOperations } from "../apis/query";
import { OperationCard } from "./OperationCard";
import { withSuspensable } from "./Suspensable";

export const OperationList: FC = withSuspensable(() => {
  const { operations } = useOperations();
  return (
    <>
      {operations?.map((operation) => (
        <OperationCard operation={operation} key={operation.id} />
      ))}
    </>
  );
});
