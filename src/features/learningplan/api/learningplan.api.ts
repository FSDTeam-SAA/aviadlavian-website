import { api } from "@/lib/api";
import { GetAllLearningPlansResponse } from "../types/learningplan.types";

export async function createLearningPlan(): Promise<unknown> {
  const res = await api.post("/learning-plan/create");
  return res.data;
}

export async function getAllLearningPlans(): Promise<GetAllLearningPlansResponse> {
  const res = await api.get<GetAllLearningPlansResponse>(
    "/learning-plan/get-all",
  );
  return res.data;
}
