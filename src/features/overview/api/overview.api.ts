import { api } from "@/lib/api";

export interface ProgressData {
  totalQuiz: number;
  totalQuestions: number;
  totalFlashcards: number;
  totalNotes?: number;
  totalHighlights?: number;
}

export interface ProgressResponse {
  message: string;
  statusCode: number;
  status: string;
  data: ProgressData;
}

export async function getOverallProgress(): Promise<ProgressResponse> {
  const res = await api.get<ProgressResponse>("/progress");
  return res.data;
}
