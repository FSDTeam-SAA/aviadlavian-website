// src/features/usermanage/types/usermanage.types.ts

export interface UserProfileImage {
  public_id: string;
  secure_url: string;
}

export interface User {
  _id: string;
  email: string;
  role: string;
  country?: string;
  FirstName?: string;
  LastName?: string;
  firstName?: string;
  lastName?: string;
  status?: string;
  isVerified?: boolean;
  address?: string;
  instituteName?: string;
  idNumber?: string;
  registrationNumber?: string;
  dateOfBirth?: string;
  profession?: string;
  // The API sometimes returns an empty array instead of an object for missing images
  profileImage?: UserProfileImage | unknown[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalUsers: number;
  totalPages: number;
}

export interface GetAllUsersResponse {
  message: string;
  statusCode: number;
  status: string;
  data: User[];
  meta: PaginationMeta;
}

export interface GetSingleUserResponse {
  message: string;
  statusCode: number;
  data: User;
}

export interface UpdateUserPayload {
  FirstName?: string;
  LastName?: string;
  country?: string;
  status?: string;
  image?: File;
}
