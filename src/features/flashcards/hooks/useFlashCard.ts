import { useQuery } from "@tanstack/react-query";
import { getInjuriesByRegion, getinjuryFilterOptions } from "../api/flashcard";

export const useInjuryFilters = () => {
  return useQuery({
    queryKey: ["injuryFilterOptions"],
    queryFn: getinjuryFilterOptions,
  });
};

export const useInjuriesByRegion = (region: string) => {
  return useQuery({
    queryKey: ["injuriesByRegion", region],
    queryFn: () => getInjuriesByRegion(region),
    enabled: !!region,
  });
};
