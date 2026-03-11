import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createLearningPlan,
  getAllLearningPlans,
  updateFlashcard,
  getMCQs,
} from "../api/learningplan.api";

export function useLearningPlan() {
  return useQuery({
    queryKey: ["learning-plan"],
    queryFn: async () => {
      const [, plansRes] = await Promise.all([
        createLearningPlan(),
        getAllLearningPlans(),
      ]);
      return plansRes;
    },
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
      // Invalidate the learning-plan query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["learning-plan"] });
    },
  });
}

export function useGetMCQs(topicId: string) {
  return useQuery({
    queryKey: ["mcqs", topicId],
    queryFn: () => getMCQs(topicId),
  });
}
