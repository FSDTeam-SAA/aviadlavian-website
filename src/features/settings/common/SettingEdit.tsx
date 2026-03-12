"use client";

import React, { useState, useEffect } from "react";
import { Camera, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { api } from "@/lib/api";
import { getSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { User, UserProfileImage } from "../types/usermanage.type";
import { useUpdateSettings } from "../hooks/useUpdateSettings";

// Fetch current user profile
const useMyProfile = () => {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const session = await getSession();
      const res = await api.get("/user/get-my-profile", {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      return res.data;
    },
  });
};

// type SettingEditProps = {
//   onClose?: () => void;
// };

const SettingEdit = () => {
  const { data: profileData, isLoading: isProfileLoading } = useMyProfile();
  const user = profileData?.data as User | undefined;

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { mutate: updateSettings, isPending } = useUpdateSettings();

  const { register, handleSubmit, reset } = useForm<User>({
    defaultValues: {
      FirstName: "",
      LastName: "",
      // email: "",
      address: "",
      country: "",
      instituteName: "",
      dateOfBirth: "",
      idNumber: "",
      registrationNumber: "",
    },
  });

  // Pre-fill form when user data loads
  useEffect(() => {
    if (user) {
      reset({
        FirstName: user.FirstName || user.firstName || "",
        LastName: user.LastName || user.lastName || "",
        // email: user.email || "",
        address: user.address || "",
        country: user.country || "",
        instituteName: user.instituteName || "",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : "",
        idNumber: user.idNumber || "",
        registrationNumber: user.registrationNumber || "",
      });
      // Note: We avoid setting profileImage directly in this effect to prevent a React strict mode warning.
      // The default image will be derived during render or handled by the file selection.
    }
  }, [user, reset]);

  // Derived state to safely load the initial avatar without triggering effects
  const currentAvatar =
    profileImage ||
    (user?.profileImage && !Array.isArray(user.profileImage)
      ? (user.profileImage as UserProfileImage).secure_url
      : null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: Partial<User>) => {
    const formData = new FormData();

    // Append all text fields if they exist
    if (data.FirstName) formData.append("FirstName", data.FirstName);
    if (data.LastName) formData.append("LastName", data.LastName);
    // if (data.email) formData.append("email", data.email);
    if (data.address) formData.append("address", data.address);
    if (data.country) formData.append("country", data.country);
    if (data.instituteName)
      formData.append("instituteName", data.instituteName);
    if (data.idNumber) formData.append("idNumber", data.idNumber);
    if (data.registrationNumber)
      formData.append("registrationNumber", data.registrationNumber);
    if (data.dateOfBirth)
      formData.append("dateOfBirth", data.dateOfBirth.toString());

    // Append image file if changed
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    updateSettings(formData, {
      onSuccess: () => {
        toast.success("Profile updated successfully!");
        setSelectedFile(null);
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to update profile. Please try again.");
      },
    });
  };

  if (isProfileLoading) {
    return (
      <div className="w-full flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Profile Settings
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        {/* Profile Picture */}
        <div>
          <Label className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Your Profile Picture
          </Label>
          <div className="mt-2">
            <label
              htmlFor="profile-upload"
              className="group relative flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500"
            >
              {currentAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentAvatar}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-center">
                  <Camera
                    className="text-slate-400 dark:text-slate-500"
                    size={32}
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Upload your
                    <br />
                    photo
                  </span>
                </div>
              )}
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid ">
          <Label
            htmlFor="firstName"
            className="text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            First Name
          </Label>
          <Input
            id="firstName"
            type="text"
            {...register("FirstName")}
            placeholder="Enter First Name"
            className="mt-2 border-slate-300 dark:border-slate-600 dark:bg-slate-800"
          />
        </div>

        {/* Last Name */}
        <div>
          <Label
            htmlFor="lastName"
            className="text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            Last Name
          </Label>
          <Input
            id="lastName"
            type="text"
            {...register("LastName")}
            placeholder="Enter Last Name"
            className="mt-2 border-slate-300 dark:border-slate-600 dark:bg-slate-800"
          />
        </div>

        {/* Email */}
        <div>
          <Label
            htmlFor="email"
            className="text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            disabled // Form sample payload didn't update email, usually email is read-only in profile settings
            placeholder="Enter Email"
            className="mt-2 border-slate-300 dark:border-slate-600 dark:bg-slate-800 opacity-60 cursor-not-allowed"
          />
        </div>

        {/* Address */}
        <div>
          <Label
            htmlFor="address"
            className="text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            Address
          </Label>
          <Input
            id="address"
            type="text"
            {...register("address")}
            placeholder="Enter Your Address"
            className="mt-2 border-slate-300 dark:border-slate-600 dark:bg-slate-800"
          />
        </div>

        {/* Country */}
        <div>
          <Label
            htmlFor="country"
            className="text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            Country
          </Label>
          <Input
            id="country"
            type="text"
            {...register("country")}
            placeholder="Enter Your Country"
            className="mt-2 border-slate-300 dark:border-slate-600 dark:bg-slate-800"
          />
        </div>

        {/* Institution Name */}
        <div>
          <Label
            htmlFor="institution"
            className="text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            Institution Name
          </Label>
          <Input
            id="institution"
            type="text"
            {...register("instituteName")}
            placeholder="Enter Institution Name"
            className="mt-2 border-slate-300 dark:border-slate-600 dark:bg-slate-800"
          />
        </div>

        {/* Date of Birth */}
        <div>
          <Label
            htmlFor="dob"
            className="text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            Date of Birth
          </Label>
          <Input
            id="dob"
            type="date"
            {...register("dateOfBirth")}
            placeholder="dd/mm/yyyy"
            className="mt-2 border-slate-300 dark:border-slate-600 dark:bg-slate-800"
          />
        </div>

        {/* ID Number */}
        <div>
          <Label
            htmlFor="idNumber"
            className="text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            Id Number
          </Label>
          <Input
            id="idNumber"
            type="text"
            {...register("idNumber")}
            placeholder="Enter Id Number"
            className="mt-2 border-slate-300 dark:border-slate-600 dark:bg-slate-800"
          />
        </div>

        {/* Registration Number */}
        <div>
          <Label
            htmlFor="registrationNumber"
            className="text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            Registration Number
          </Label>
          <Input
            id="registrationNumber"
            type="text"
            {...register("registrationNumber")}
            placeholder="Enter Registration Number"
            className="mt-2 border-slate-300 dark:border-slate-600 dark:bg-slate-800"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => {
              if (user) {
                reset();
                if (user.profileImage && !Array.isArray(user.profileImage)) {
                  setProfileImage(
                    (user.profileImage as UserProfileImage).secure_url,
                  );
                } else {
                  setProfileImage(null);
                }
                setSelectedFile(null);
              }
            }}
            className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingEdit;
