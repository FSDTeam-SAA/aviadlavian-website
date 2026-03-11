import { api } from "@/lib/api";

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
}) {
  const res = await api.post(`/flashcard-progress/create-review`, data);
  return res.data;
}
export async function getFlashcardProgress(topicId: string) {
  const res = await api.get(`/flashcard-progress/my-progress/${topicId}`);
  return res.data;
}
