// src/features/settings/hooks/useUpdateSettings.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSettings } from "../api/settings.api";

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FormData) => updateSettings(payload),
    onSuccess: () => {
      // Invalidate user queries to refetch the updated profile
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
    },
  });
}
