import { api } from "@/lib/api";
import { SampleItem, UserProfile } from "../types";

// Example: GET all items
export async function getSampleItems(): Promise<SampleItem[]> {
  const res = await api.get("/sample");
  return res.data;
}

type GetMyProfileResponse = {
  message: string;
  statusCode: number;
  status: string;
  data: UserProfile;
};

export async function getMyProfile(): Promise<UserProfile> {
  const res = await api.get<GetMyProfileResponse>("/user/get-my-profile");
  return res.data.data;
}
