"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useSubmitFeedback } from "../hooks/useFeedback";

const feedbackTypes = [
  "General Feedback",
  "Feature request",
  "Bug Report",
  "Improvement Suggestion",
] as const;

type FeedbackType = (typeof feedbackTypes)[number];

const maxRating = 5;

export default function FeedbackSupportPage() {
  const [selectedType, setSelectedType] = useState<FeedbackType>("Bug Report");
  const [rating, setRating] = useState(4);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const { mutateAsync: submitFeedback, isPending: isSubmitting } =
    useSubmitFeedback();

  const isValid = useMemo(() => {
    return subject.trim().length > 0 && message.trim().length > 0;
  }, [subject, message]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValid) {
      toast.error("Please fill in subject and message");
      return;
    }

    try {
      await submitFeedback({
        type: selectedType,
        rating,
        subject,
        message,
      });
      toast.success("Feedback sent successfully");
      setSubject("");
      setMessage("");
      setRating(4);
      setSelectedType("Bug Report");
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to send feedback";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-full bg-[#f5f4f1] px-3 py-4 sm:px-5 lg:px-6">
      <form onSubmit={handleSubmit} className="mx-auto  space-y-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Feedback & Support
          </h1>
          <p className="mt-3 text-xl text-slate-900">
            Help us improve MSK Nexus by sharing your thoughts and experiences.
          </p>
        </div>

        <section className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-black/5 sm:p-5">
          <h2 className="text-2xl font-semibold text-slate-900">
            What type of feedback would you like to share?
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {feedbackTypes.map((type) => {
              const isSelected = selectedType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-4 py-3 text-left text-sm font-medium transition",
                    isSelected
                      ? "border-teal-200 bg-teal-100/80 text-slate-900"
                      : "border-teal-100 bg-white text-slate-800 hover:border-teal-200 hover:bg-teal-50/50",
                  )}
                >
                  <span
                    className={cn(
                      "h-4 w-4 rounded-full border border-teal-500",
                      isSelected && "bg-teal-500 ring-2 ring-teal-200",
                    )}
                  />
                  <span>{type}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-black/5 sm:p-5">
          <h2 className="text-2xl font-semibold text-slate-900">
            How would you rate your overall experience?
          </h2>
          <div className="mt-5 flex items-center gap-2">
            {Array.from({ length: maxRating }, (_, index) => {
              const value = index + 1;
              const active = value <= rating;
              return (
                <button
                  key={value}
                  type="button"
                  aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                  onClick={() => setRating(value)}
                  className="transition hover:scale-105"
                >
                  <Star
                    className={cn(
                      "size-8",
                      active
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-slate-300",
                    )}
                  />
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-black/5 sm:p-5">
          <h2 className="text-3xl font-semibold text-slate-900">Details</h2>
          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="feedback-subject"
                className="text-base font-medium text-slate-900"
              >
                Subject
              </label>
              <Input
                id="feedback-subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Brief Description of your feedback"
                className="h-11 rounded-lg border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="feedback-message"
                className="text-base font-medium text-slate-900"
              >
                Message
              </label>
              <Textarea
                id="feedback-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Please provide detailed feedback, including any specific features, issues or suggestions you’d like to share......."
                className="min-h-[180px] rounded-lg border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="flex justify-center pt-2">
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="h-10 min-w-32 rounded-md bg-[#23b7af] px-6 text-sm font-medium text-white hover:bg-[#1ba29b]"
              >
                {isSubmitting ? "Sending..." : "Send Feedback"}
              </Button>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
