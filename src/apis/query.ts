import { Operation, Response } from "models/operation";
import useSWRInfinite from "swr/infinite";
import { PaginatedResponse } from "../models/operation";


export const useOperations = () => {
  const { data, ...rest } = useSWRInfinite<
    Response<PaginatedResponse<Operation>>
  >((pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData?.data.hasNext) return null; // reached the end
    return `/copilot/query?desc=true&page=${(previousPageData?.data?.page || 0) + 1}&limit=50`; // SWR key
  });

  const operations = data
    ? ([] as Operation[]).concat(...data.map((el) => el.data.data))
    : [];
  return { operations, ...rest };
};
