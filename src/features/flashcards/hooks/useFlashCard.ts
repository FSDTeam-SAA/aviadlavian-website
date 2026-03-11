import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getInjuriesByRegion,
  getinjuryFilterOptions,
  getInjuryFlashcard,
  getInjuryFlashcardId,
  createFlashcardReview,
  getFlashcardProgress,
} from "../api/flashcard";

export const useInjuryFilters = () => {
  return useQuery({
    queryKey: ["injuryFilterOptions"],
    queryFn: getinjuryFilterOptions,
  });
};

export const useInjuriesByRegion = (region: string) => {
  return useQuery({
    queryKey: ["injuriesByRegion", region],
    queryFn: () => getInjuriesByRegion(region),
    enabled: !!region,
  });
};

// add all flashcard

export const useAllFlashcards = (id: string) => {
  return useQuery({
    queryKey: ["injuryFlashcard", id],
    queryFn: () => getInjuryFlashcard(id),
    enabled: !!id,
  });
};

//single flashcard by id
export const useInjuryFlashcardId = (id: string) => {
  return useQuery({
    queryKey: ["injuryFlashcardId", id],
    queryFn: () => getInjuryFlashcardId(id),
    enabled: !!id,
  });
};

// create flashcard review mutation
export const useCreateFlashcardReview = () => {
  return useMutation({
    mutationFn: createFlashcardReview,
  });
};

export const useFlashcardProgress = (topicId: string) => {
  return useQuery({
    queryKey: ["flashcardProgress", topicId],
    queryFn: () => getFlashcardProgress(topicId),
    enabled: !!topicId,
  });
};
