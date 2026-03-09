import { useQuery } from "@tanstack/react-query";
import {
  createLearningPlan,
  getAllLearningPlans,
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
