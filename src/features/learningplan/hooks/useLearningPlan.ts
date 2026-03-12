import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createLearningPlan,
  getLearningPlans,
  updateFlashcard,
  updateArticleStatus,
  getMCQs,
  addQuizToLearningPlan,
  getArticleAnnotations,
} from "../api/learningplan.api";

export function useLearningPlan() {
  return useQuery({
    queryKey: ["learning-plan"],
    queryFn: async () => {
      const plansRes = await getLearningPlans();
      if (plansRes.data && plansRes.data.length > 0) {
        return plansRes;
      }
      await createLearningPlan();
      return await getLearningPlans();
    },
  });
}

// Added per user request
export function useLearningPlans() {
  return useQuery({
    queryKey: ["learning-plans"],
    queryFn: () => getLearningPlans(),
  });
}

export function useUpdateFlashcard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      planId,
      flashcardId,
      status,
    }: {
      planId: string;
      flashcardId: string;
      status: string;
    }) => updateFlashcard(planId, flashcardId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning-plan"] });
      queryClient.invalidateQueries({ queryKey: ["learning-plans"] });
    },
  });
}

export function useUpdateArticleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      planId,
      articleId,
      status,
    }: {
      planId: string;
      articleId: string;
      status: string;
    }) => updateArticleStatus(planId, articleId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning-plan"] });
      queryClient.invalidateQueries({ queryKey: ["learning-plans"] });
    },
  });
}

export function useGetMCQs(topicId: string) {
  return useQuery({
    queryKey: ["mcqs", topicId],
    queryFn: () => getMCQs(topicId),
  });
}

export function useAddQuizToLearningPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      learningPlanId,
      quizId,
    }: {
      learningPlanId: string;
      quizId: string;
    }) => addQuizToLearningPlan(learningPlanId, quizId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning-plan"] });
      queryClient.invalidateQueries({ queryKey: ["learning-plans"] });
    },
  });
}

export function useAnnotations(articleId: string) {
  return useQuery({
    queryKey: ["article-annotations", articleId],
    queryFn: () => getArticleAnnotations(articleId),
    enabled: !!articleId,
  });
}
