"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordResponse {
  message: string;
  // Add other response fields as needed
}

interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (password: string) => {
      if (!token) {
        throw new Error("Reset token is missing");
      }

      const response = await axios.post<ResetPasswordResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/user/reset-password/${token}`,
        { password },
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Password reset successfully!", {
        description: "You can now sign in with your new password.",
        duration: 5000,
      });

      // Redirect to sign-in page after successful reset
      setTimeout(() => {
        router.push("/auth/sign-in");
      }, 2000); // Small delay to allow user to read the success message
    },
    onError: (error: ErrorResponse) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to reset password. Please try again.";

      toast.error("Password reset failed", {
        description: errorMessage,
        duration: 5000,
      });

      console.error("Reset password error:", error);
    },
  });

  function onSubmit(values: ResetPasswordFormValues) {
    if (!token) {
      toast.error("Invalid reset link", {
        description:
          "The reset token is missing. Please request a new password reset link.",
        duration: 5000,
      });
      return;
    }

    resetPasswordMutation.mutate(values.newPassword);
  }

  // Show error if token is missing
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f0e4] p-4">
        <div className="w-full max-w-[500px] rounded-xl bg-[#1f2123] p-8 text-center text-white shadow-2xl">
          <h2 className="mb-4 text-2xl font-semibold text-red-400">
            Invalid Reset Link
          </h2>
          <p className="mb-6 text-gray-400">
            The password reset link is invalid or has expired.
          </p>
          <Button
            onClick={() => router.push("/auth/forgot-password")}
            className="bg-[#0fb7a8] text-white hover:bg-[#0da396]"
          >
            Request New Reset Link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f0e4] p-4">
      <div className="w-full max-w-[500px] rounded-xl bg-[#1f2123] p-8 text-white shadow-2xl">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="mb-6 text-2xl font-bold uppercase tracking-widest">
            LOGO
          </h1>
          <h2 className="text-2xl font-semibold text-[#0fb7a8]">
            Create a New Password
          </h2>
          <p className="mt-2 text-xs text-gray-400">
            Set a strong password to secure your account.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* New Password Field */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <h4 className="text-[10px] text-[#f7f0e4] uppercase">
                    New Password
                  </h4>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••"
                      {...field}
                      disabled={resetPasswordMutation.isPending}
                      className="border-[#f7f0e4] bg-transparent py-5 focus-visible:ring-[#0fb7a8] disabled:opacity-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm New Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <h4 className="text-[10px] text-[#f7f0e4] uppercase">
                    Confirm New Password
                  </h4>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••"
                      {...field}
                      disabled={resetPasswordMutation.isPending}
                      className="border-[#f7f0e4] bg-transparent py-5 focus-visible:ring-[#0fb7a8] disabled:opacity-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={resetPasswordMutation.isPending}
              className="w-full bg-[#0fb7a8] py-6 text-white hover:bg-[#0da396] disabled:opacity-50"
            >
              {resetPasswordMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Resetting Password...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </Form>

        {/* Link back to sign in */}
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-400">Remember your password? </span>
          <Link
            href="/auth/sign-in"
            className="text-[#0fb7a8] hover:underline"
            onClick={(e) => {
              e.preventDefault();
              router.push("/auth/sign-in");
            }}
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
