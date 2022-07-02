import { Operation, Response } from "models/operation";
import useSWRInfinite from "swr/infinite";
import { PaginatedResponse } from "../models/operation";

const useOperationsGetKey = (pageIndex, previousPageData) => {
  if (previousPageData && !previousPageData.length) return null; // reached the end
  return `/query?desc=true&page=${pageIndex + 1}&limit=50`; // SWR key
};

export const useOperations = () => {
  const { data, ...rest } =
    useSWRInfinite<Response<PaginatedResponse<Operation>>>(useOperationsGetKey);
  const operations = data
    ? ([] as Operation[]).concat(...data.map((el) => el.data.data))
    : [];
  return { operations, ...rest };
};
