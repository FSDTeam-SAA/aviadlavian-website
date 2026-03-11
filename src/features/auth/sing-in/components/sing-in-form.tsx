"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signInSchema } from "../schema/singInSchema";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

const SignInForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(values: z.infer<typeof signInSchema>) {
    try {
      setIsLoading(true);
      setError(null);

      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.error) {
        switch (result.error) {
          case "CredentialsSignin":
            setError("Invalid email or password");
            toast.error("Invalid email or password");
            break;
          default:
            setError("An error occurred. Please try again.");
            toast.error("An error occurred. Please try again.");
        }
        console.error("Sign in error:", result.error);
        return;
      }

      toast.success("Signed in successfully!");
      if (values.rememberMe) {
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign in error:", error);
      setError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f0e4] p-4">
      <div className="w-full max-w-[500px] rounded-xl bg-[#1f2123] p-8 text-white shadow-2xl">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold uppercase tracking-widest">
            Logo
          </h1>
          <h2 className="text-2xl font-semibold text-[#0fb7a8]">Welcome</h2>
          <p className="mt-2 text-xs text-gray-400">
            Manage your orders, track shipments, and configure products easily.
          </p>
        </div>

        {/* Error Message Display */}
        {error && (
          <div className="mb-4 rounded-md bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
            {error}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <h4 className="text-[10px] text-[#f7f0e4] uppercase">
                    Email Address
                  </h4>
                  <FormControl>
                    <Input
                      placeholder="hello@example.com"
                      {...field}
                      disabled={isLoading}
                      className="border-[#f7f0e4] bg-transparent py-5 focus-visible:ring-[#0fb7a8] disabled:opacity-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <h4 className="text-[10px] text-[#f7f0e4] uppercase">
                    Password
                  </h4>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••••••"
                      {...field}
                      disabled={isLoading}
                      className="border-[#f7f0e4] bg-transparent py-5 focus-visible:ring-[#0fb7a8] disabled:opacity-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Remember Me & Forgot Password Section */}
            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        id="rememberMe"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                        className="border-[#f7f0e4] data-[state=checked]:bg-[#0fb7a8] data-[state=checked]:border-[#0fb7a8] disabled:opacity-50"
                      />
                    </FormControl>
                    <label
                      htmlFor="rememberMe"
                      className="text-sm text-gray-400 cursor-pointer select-none disabled:cursor-not-allowed"
                    >
                      Remember me
                    </label>
                  </FormItem>
                )}
              />

              <Link
                href="/auth/forgot-password"
                className="text-sm text-[#0fb7a8] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {isLoading ? (
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0fb7a8] py-6 text-white hover:bg-[#0da396] disabled:cursor-not-allowed"
              >
                <Spinner /> Sign In
              </Button>
            ) : (
              <Button
                type="submit"
                className="w-full bg-[#0fb7a8] py-6 text-white hover:bg-[#0da396]"
              >
                Sign In
              </Button>
            )}
          </form>
        </Form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-400">Don&apos;t have an account? </span>
          <Link href={"/auth/sign-up"}>
            <button
              className="text-[#0fb7a8] hover:underline cursor-pointer disabled:opacity-50"
              disabled={isLoading}
            >
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
