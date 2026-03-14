import { api } from "@/lib/api";

export type FlashcardFilterParams = {
  page?: number;
  limit?: number;
  status?: string;
  filterBytopicId?: string;
  filterByAcuity?: string;
  filterByAgeGroup?: string;
  sortBy?: string;
  search?: string;
};

export type FlashcardResponse = {
  message: string;
  statusCode: number;
  status: string;
  data: unknown;
};

export async function getinjuryFilterOptions() {
  const res = await api.get(`/injury/filter-options/`);
  return res.data;
}

export async function getInjuriesByRegion(region: string) {
  const res = await api.get(`/injury/region/${region}`);
  return res.data;
}

// get all flashcard
export async function getInjuryFlashcard(id: string) {
  const res = await api.get(`/flashcard/get-flashcard-by-injury/${id}`);
  return res.data;
}

// 6988ccf8a6e037adb83534d1
export async function getInjuryFlashcardId(id: string) {
  const res = await api.get(`/flashcard/get-flashcard/${id}`);
  return res.data;
}

// create flashcard review
export async function createFlashcardReview(data: {
  flashcardId: string;
  result: string;
  customInterval: string;
}): Promise<FlashcardResponse> {
  const res = await api.post<FlashcardResponse>(
    `/flashcard-progress/create-review`,
    data,
  );
  return res.data;
}
export async function getFlashcardProgress(topicId: string) {
  const res = await api.get(`/flashcard-progress/my-progress/${topicId}`);
  return res.data;
}

// Get flashcards with full filter/search support
export async function getFilteredFlashcards(params: FlashcardFilterParams) {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.limit !== undefined) query.set("limit", String(params.limit));
  if (params.status) query.set("status", params.status);
  if (params.filterBytopicId)
    query.set("filterBytopicId", params.filterBytopicId);
  if (params.filterByAcuity) query.set("filterByAcuity", params.filterByAcuity);
  if (params.filterByAgeGroup)
    query.set("filterByAgeGroup", params.filterByAgeGroup);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.search) query.set("search", params.search);
  const res = await api.get(`/flashcard/get-flashcards/?${query.toString()}`);
  return res.data;
}
