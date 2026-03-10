import { api } from "@/lib/api";
import { getSession } from "next-auth/react";
import { GetAllLearningPlansResponse } from "../types/learningplan.types";

export async function createLearningPlan(): Promise<unknown> {
  const res = await api.post("/learning-plan/create");
  return res.data;
}

export async function getAllLearningPlans(): Promise<GetAllLearningPlansResponse> {
  const res = await api.get<GetAllLearningPlansResponse>(
    "/learning-plan/get-all?limit=500",
  );
  return res.data;
}

export async function updateFlashcard(
  planId: string,
  flashcardId: string,
  status: string,
): Promise<unknown> {
  const session = await getSession();
  const token = session?.accessToken || "";

  const res = await api.patch(
    `/learning-plan/${planId}/flashcard/${flashcardId}`,
    { isAnswered: status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data;
}
