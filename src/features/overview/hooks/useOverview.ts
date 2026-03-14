import { useQuery } from "@tanstack/react-query";
import { getOverallProgress } from "../api/overview.api";

export function useOverviewProgress() {
  return useQuery({
    queryKey: ["overview-progress"],
    queryFn: () => getOverallProgress(),
  });
}
