import { api } from "@/lib/api";

export async function getinjuryFilterOptions() {
  const res = await api.get(`/injury/filter-options/`);
  return res.data;
}

export async function getInjuriesByRegion(region: string) {
  const res = await api.get(`/injury/region/${region}`);
  return res.data;
}
