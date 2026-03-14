import { useQuery } from "@tanstack/react-query";
import { getMyProfile, getSampleItems } from "../api/sample.api";

export function useSampleItems() {
  return useQuery({
    queryKey: ["sample-items"],
    queryFn: getSampleItems,
  });
}

export function useMyProfile() {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: getMyProfile,
  });
}
