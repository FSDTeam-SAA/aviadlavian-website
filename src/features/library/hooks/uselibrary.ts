import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllLibraryArticles,
  getArticleAnnotations,
  saveArticleAnnotations,
  saveLearningPlan,
  getLearningPlans,
  createLearningPlan,
  addFlashcardToLearningPlan,
  ArticleAnnotations,
  AnnotationHighlight,
  AnnotationNote,
} from "../api/library";

type SaveAnnotationsPayload = Pick<ArticleAnnotations, "highlights" | "notes">;

export type { ArticleAnnotations, AnnotationHighlight, AnnotationNote };
import { LibraryQueryParams } from "../type/library";

export function useLibrary(params: LibraryQueryParams = {}) {
  return useQuery({
    queryKey: ["library-articles", params.page ?? 1, params.limit ?? 10],
    queryFn: () => getAllLibraryArticles(params),
  });
}

export function useAnnotations(articleId: string) {
  return useQuery({
    queryKey: ["article-annotations", articleId],
    queryFn: () => getArticleAnnotations(articleId),
    enabled: !!articleId,
  });
}

export function useSaveAnnotations(articleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (annotations: SaveAnnotationsPayload) =>
      saveArticleAnnotations(articleId, annotations),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["article-annotations", articleId],
      });
    },
  });
}

export function useSaveLearningPlan() {
  return useMutation({
    mutationFn: ({
      learningPlanId,
      libraryId,
    }: {
      learningPlanId: string;
      libraryId: string;
    }) => saveLearningPlan(learningPlanId, libraryId),
  });
}

export function useLearningPlans() {
  return useQuery({
    queryKey: ["learning-plans"],
    queryFn: () => getLearningPlans(),
  });
}

export function useCreateLearningPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => createLearningPlan(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["learning-plans"],
      });
    },
  });
}

export function useAddFlashcardToLearningPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      learningPlanId,
      flashcardId,
    }: {
      learningPlanId: string;
      flashcardId: string;
    }) => addFlashcardToLearningPlan(learningPlanId, flashcardId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["learning-plans"],
      });
    },
  });
}
