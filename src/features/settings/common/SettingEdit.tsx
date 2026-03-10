"use client";

import React, { useState } from "react";
import { Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// type SettingEditProps = {
//   onClose?: () => void;
// };

const SettingEdit = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Profile Settings
      </h2>

      <div className="mt-6 space-y-6">
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
              {profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profileImage}
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
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Full Name */}
          <div>
            <Label
              htmlFor="fullName"
              className="text-sm font-medium text-slate-900 dark:text-slate-100"
            >
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter Full Name"
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
              placeholder="Enter Email"
              className="mt-2 border-slate-300 dark:border-slate-600 dark:bg-slate-800"
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
              placeholder="Enter Registration Number"
              className="mt-2 border-slate-300 dark:border-slate-600 dark:bg-slate-800"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => setProfileImage(null)}
            className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingEdit;
