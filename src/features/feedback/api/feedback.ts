import { api } from "@/lib/api";

export type FeedbackRequest = {
  type: string;
  rating: number;
  subject: string;
  message: string;
};

export async function submitFeedback(data: FeedbackRequest) {
  const response = await api.post("/feedback", data);
  return response.data;
}
