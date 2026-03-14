import { api } from "@/lib/api";
import { getSession } from "next-auth/react";
import {
  GetAllLearningPlansResponse,
  BaseResponse,
  ArticleAnnotationsResponse,
} from "../types/learningplan.types";

export async function createLearningPlan(): Promise<BaseResponse> {
  const res = await api.post("/learning-plan/create");
  return res.data;
}

export async function getLearningPlans(): Promise<GetAllLearningPlansResponse> {
  const res = await api.get<GetAllLearningPlansResponse>(
    "/learning-plan/get-all?limit=500",
  );
  return res.data;
}

export async function updateFlashcard(
  planId: string,
  flashcardId: string,
  status: string,
): Promise<BaseResponse> {
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

export async function updateArticleStatus(
  planId: string,
  articleId: string,
  status: string,
): Promise<BaseResponse> {
  const session = await getSession();
  const token = session?.accessToken || "";

  const res = await api.patch(
    `/learning-plan/${planId}/article/${articleId}`,
    { isRead: status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data;
}

export async function getMCQs(topicId: string): Promise<BaseResponse> {
  const session = await getSession();
  const token = session?.accessToken || "";

  const res = await api.get(`/questionbank/topics/${topicId}/attempt`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function addQuizToLearningPlan(
  learningPlanId: string,
  quizId: string,
): Promise<BaseResponse> {
  const res = await api.post(`/learning-plan/${learningPlanId}/quiz`, {
    quizId,
  });
  return res.data;
}

export async function getArticleAnnotations(
  articleId: string,
): Promise<ArticleAnnotationsResponse> {
  const session = await getSession();
  const token = session?.accessToken || "";

  const res = await api.get(`/article-annotations/${articleId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}
