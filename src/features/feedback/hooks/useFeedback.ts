import { useMutation } from "@tanstack/react-query";
import { submitFeedback } from "../api/feedback";

export const useSubmitFeedback = () => {
  return useMutation({
    mutationFn: submitFeedback,
  });
};
