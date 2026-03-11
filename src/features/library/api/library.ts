import { api } from "@/lib/api";
import {
  GetAllLibraryArticlesResponse,
  LibraryQueryParams,
  LibraryTopic,
} from "../type/library";

export type AnnotationHighlight = {
  id: string; // chapterId / topicId — used to filter highlights per chapter
  text: string;
  range: { from: number; to: number } | { nodePath: string };
  color: string;
};

export type AnnotationNote = {
  id: string;
  content: string;
};

export type ArticleAnnotations = {
  _id?: string;
  articleId?: string;
  userId?: string;
  highlights: AnnotationHighlight[];
  notes: AnnotationNote[];
  createdAt?: string;
  updatedAt?: string;
};

type GetAnnotationsApiResponse = {
  message: string;
  statusCode: number;
  status: string;
  data: ArticleAnnotations;
};

export async function getAllLibraryArticles(
  params?: LibraryQueryParams,
): Promise<GetAllLibraryArticlesResponse> {
  const response = await api.get<GetAllLibraryArticlesResponse>(
    "/article/get-all",
    {
      params,
    },
  );

  return response.data;
}

export async function getArticleAnnotations(
  articleId: string,
): Promise<ArticleAnnotations> {
  const response = await api.get<GetAnnotationsApiResponse>(
    `/article-annotations/${articleId}`,
  );
  return response.data.data;
}

export async function saveArticleAnnotations(
  articleId: string,
  annotations: Pick<ArticleAnnotations, "highlights" | "notes">,
): Promise<ArticleAnnotations> {
  const response = await api.patch<GetAnnotationsApiResponse>(
    `/article-annotations/${articleId}`,
    annotations,
  );
  return response.data.data;
}

type SaveLearningPlanResponse = {
  message: string;
  statusCode: number;
  status: string;
  data: Record<string, unknown>;
};

export async function saveLearningPlan(
  learningPlanId: string,
  libraryId: string,
): Promise<Record<string, unknown>> {
  const response = await api.post<SaveLearningPlanResponse>(
    `/learning-plan/${learningPlanId}/article`,
    { articleId: libraryId },
  );
  return response.data.data;
}

export type LearningPlanArticle = {
  articleId: {
    _id: string;
    name: string;
    topicIds: LibraryTopic[];
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  isRead: "read" | "unread";
  readAt?: string;
  _id: string;
};

export type LearningPlanData = {
  _id: string;
  userId: string;
  isActive: boolean;
  articles: LearningPlanArticle[];
  flashcards: unknown[];
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type GetLearningPlansResponse = {
  message: string;
  statusCode: number;
  status: string;
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  data: LearningPlanData[];
};

export async function getLearningPlans(): Promise<LearningPlanData[]> {
  const response = await api.get<GetLearningPlansResponse>(
    "/learning-plan/get-all",
  );
  return response.data.data;
}

export async function createLearningPlan(): Promise<LearningPlanData> {
  const response = await api.post<{
    message: string;
    statusCode: number;
    status: string;
    data: LearningPlanData;
  }>("/learning-plan/create");
  return response.data.data;
}
