"use client";

import React, { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Define the schema for 6 digits
const otpSchema = z.object({
  otp: z.array(z.string().length(1)).length(6),
});

const EnterOtpForm = () => {
  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: ["", "", "", "", "", ""],
    },
  });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function onSubmit(values: z.infer<typeof otpSchema>) {
    const otpString = values.otp.join("");
    console.log("Submitted OTP:", otpString);
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !form.getValues(`otp.${index}`) && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const value = e.target.value.slice(-1);
    if (!/^\d?$/.test(value)) return;

    const currentOtp = [...form.getValues("otp")];
    currentOtp[index] = value;
    form.setValue(
      "otp",
      currentOtp as [string, string, string, string, string, string],
    );

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f0e4] p-4">
      <div className="w-full max-w-[500px] rounded-xl bg-[#1f2123] p-8 text-white shadow-2xl">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-2xl font-bold uppercase tracking-[0.2em]">
            Logo
          </h1>
          <h2 className="text-2xl font-semibold text-[#0fb7a8]">
            Verify Your Account
          </h2>
          <p className="mt-2 text-xs text-gray-400">
            Enter the 6-digit code sent to your email to continue.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-between gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name={`otp.${index}`}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <Input
                          {...field}
                          ref={(el) => {
                            inputRefs.current[index] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          className="h-14 w-full border-gray-600 bg-transparent text-center text-xl font-bold focus-visible:border-[#0fb7a8] focus-visible:ring-1 focus-visible:ring-[#0fb7a8]"
                          onChange={(e) => handleChange(e, index)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {/* Timer & Resend */}
            <div className="flex items-center justify-between px-1 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <span className="text-sm">🕒</span>
                <span>00:30</span>
              </div>
              <p>
                Didn&apos;t get a code?{" "}
                <button
                  type="button"
                  className="text-[#0fb7a8] hover:underline"
                >
                  Resend
                </button>
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#0fb7a8] py-6 text-lg font-semibold text-white hover:bg-[#0da396]"
            >
              Verify
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EnterOtpForm;
