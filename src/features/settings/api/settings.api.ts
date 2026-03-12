// src/features/settings/api/settings.api.ts
import { api } from "@/lib/api";
import { getSession } from "next-auth/react";

export async function updateSettings(settings: FormData) {
  const session = await getSession();
  const res = await api.patch("/user/update-user", settings, {
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}
