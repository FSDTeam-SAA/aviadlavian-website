"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useInjuryFlashcardId,
  useAllFlashcards,
  useCreateFlashcardReview,
  useFilteredFlashcards,
} from "../hooks/useFlashCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useLearningPlans,
  useAddFlashcardToLearningPlan,
} from "@/features/library/hooks/uselibrary";

type FlashCardDetailsProps = {
  subspecialty?: string;
  chapter?: string;
  lastid?: string;
  flashcardId?: string;
  totalFlashcards?: number;
  filteredFlashcards?: number;
  status?: string;
  acuity?: string;
  ageGroup?: string;
  sortBy?: string;
  search?: string;
};

const FlashCardDetails = ({
  subspecialty = "Knee",
  chapter = "Chondromalacia Patella",
  lastid,
  flashcardId,
  totalFlashcards = 0,
  filteredFlashcards = 0,
  status,
  acuity,
  ageGroup,
  sortBy,
  search,
}: FlashCardDetailsProps) => {
  const router = useRouter();
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [confidenceRating, setConfidenceRating] = useState<string | null>(null);

  const { data: flashdata } = useInjuryFlashcardId(lastid || "");

  // Use filtered flashcards if any filter is active, otherwise use all flashcards for topic
  const hasStudyFilters = !!(status || acuity || ageGroup || sortBy || search);

  const { data: flashcardsByTopic } = useAllFlashcards(
    !hasStudyFilters ? flashcardId || "" : "",
  );

  const { data: filteredStudyData } = useFilteredFlashcards({
    page: 1,
    limit: 1000,
    status,
    filterBytopicId: flashcardId,
    filterByAcuity: acuity,
    filterByAgeGroup: ageGroup,
    sortBy,
    search,
  });

  const createReviewMutation = useCreateFlashcardReview();

  const chapterFlashcards =
    ((hasStudyFilters
      ? filteredStudyData?.data
      : flashcardsByTopic?.data) as Array<{
      _id: string;
    }>) || [];
  const safeTotalFlashcards = totalFlashcards || chapterFlashcards.length;
  const currentIndex = chapterFlashcards.findIndex(
    (card) => card._id === lastid,
  );
  const currentStep = currentIndex >= 0 ? currentIndex + 1 : 0;

  const { data: learningPlans } = useLearningPlans();
  const addFlashcardToPlanMutation = useAddFlashcardToLearningPlan();

  const handleAddToLearningPlan = () => {
    const activePlan =
      learningPlans?.find((p) => p.isActive) || learningPlans?.[0];

    if (!activePlan) {
      toast.error("No active learning plan found");
      return;
    }

    if (!lastid) return;

    addFlashcardToPlanMutation.mutate(
      {
        learningPlanId: activePlan._id,
        flashcardId: lastid,
      },
      {
        onSuccess: (data) => {
          toast.success(data?.message || "Added to learning plan successfully");
        },
        onError: (err) => {
          toast.error(err?.message || "Failed to add to learning plan");
        },
      },
    );
  };

  const handleSubmitReview = (rating: "correct" | "incorrect" | "unknown") => {
    if (!lastid) {
      toast.error("Flashcard not found");
      return;
    }

    setConfidenceRating(rating);

    const resultMap: Record<string, string> = {
      correct: "correct",
      incorrect: "wrong",
      unknown: "unknown",
    };

    createReviewMutation.mutate(
      {
        flashcardId: lastid,
        result: resultMap[rating] || "wrong",
      },
      {
        onSuccess: (data) => {
          toast.success(data?.message || "Review saved successfully");
          setConfidenceRating(null);
          setIsAnswerRevealed(false);
          router.back();
        },
        onError: (err) => {
          toast.error(err?.message || "Failed to save review");
        },
      },
    );
  };

  const question = flashdata?.data?.question || "Loading...";
  const answer = flashdata?.data?.answer || "Loading...";

  const goToFlashcardByIndex = (index: number) => {
    if (!flashcardId || !chapterFlashcards[index]?._id) return;

    const query = new URLSearchParams({
      subspecialty: subspecialty || "",
      chapter: chapter || "",
      totalFlashcards: String(safeTotalFlashcards),
      filteredFlashcards: String(filteredFlashcards || 0),
      status: status || "",
      acuity: acuity || "",
      ageGroup: ageGroup || "",
      sortBy: sortBy || "",
      search: search || "",
    });

    router.push(
      `/flashcards/${flashcardId}/${chapterFlashcards[index]._id}?${query.toString()}`,
    );
  };

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 dark:border-slate-700 dark:bg-slate-900">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Flashcards
          </h1>
          <Link
            href={{
              pathname: `/flashcards/${flashcardId || ""}`,
              query: {
                subspecialty,
                chapter,
                status,
                acuity,
                ageGroup,
                sortBy,
                search,
              },
            }}
            className="w-fit rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Back to List
          </Link>
        </div>

        {/* Breadcrumb */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-bold text-orange-700 dark:text-orange-400">
          <Link
            href="/flashcards"
            className="hover:underline uppercase tracking-tight"
          >
            Flashcards
          </Link>
          <span className="text-slate-400 font-normal px-0.5">›</span>
          <span className="uppercase tracking-tight">{subspecialty}</span>
          <span className="text-slate-400 font-normal px-0.5">›</span>
          <Link
            href={`/flashcards/${flashcardId}?subspecialty=${subspecialty}&chapter=${chapter}`}
            className="truncate hover:underline uppercase tracking-tight max-w-[150px] sm:max-w-none"
          >
            {chapter}
          </Link>
          <span className="text-slate-400 font-normal px-0.5">›</span>
          <span className="shrink-0 text-slate-500 dark:text-slate-500 uppercase tracking-tight">
            Study
          </span>
        </div>

        <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          {safeTotalFlashcards} flashcards in this chapter
          {filteredFlashcards > 0 && filteredFlashcards !== safeTotalFlashcards
            ? ` • ${filteredFlashcards} from filtered results`
            : ""}
        </p>

        {/* Main Content */}
        <div className="mt-8  max-w-3xl">
          <div className="flex items-center justify-between ">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Current Flashcard
            </h2>
            <Button
              onClick={handleAddToLearningPlan}
              disabled={addFlashcardToPlanMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {addFlashcardToPlanMutation.isPending
                ? "Adding..."
                : "Add to learning plan"}
            </Button>
          </div>

          {/* Question and Answer Card */}
          <div className="mt-4 overflow-hidden rounded-2xl border border-orange-200 shadow-sm dark:border-orange-900/30">
            {/* Question Section */}
            <div className="bg-orange-50/50 p-6 sm:p-10 dark:bg-orange-950/10">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100/50 text-3xl dark:bg-orange-900/20">
                  🫀
                </div>
              </div>
              <p className="text-center text-base sm:text-lg font-medium leading-relaxed text-slate-800 dark:text-slate-200">
                {question}
              </p>
            </div>

            {/* Answer Section */}
            <div className="bg-white p-6 sm:p-8 dark:bg-slate-900 border-t border-orange-100 dark:border-orange-900/20">
              {!isAnswerRevealed ? (
                <button
                  type="button"
                  onClick={() => setIsAnswerRevealed(true)}
                  className="mx-auto block w-full sm:w-64 rounded-xl bg-orange-700 py-3 text-center font-bold text-white shadow-lg shadow-orange-700/20 transition hover:bg-orange-800 active:scale-95"
                >
                  Reveal Answer
                </button>
              ) : (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500 text-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#007b5e]">
                    Answer
                  </span>
                  <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    {answer}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Interaction Area */}
          {isAnswerRevealed && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <p className="text-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                How well did you know this?
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  disabled={createReviewMutation.isPending}
                  onClick={() => handleSubmitReview("correct")}
                  className={`flex-1 min-w-[100px] rounded-xl border-2 py-3 px-4 text-sm font-bold transition-all ${
                    confidenceRating === "correct"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                      : "border-slate-100 bg-slate-50 text-slate-600 hover:border-emerald-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                  }`}
                >
                  {createReviewMutation.isPending &&
                  confidenceRating === "correct"
                    ? "Saving..."
                    : "Correct"}
                </button>
                <button
                  type="button"
                  disabled={createReviewMutation.isPending}
                  onClick={() => handleSubmitReview("incorrect")}
                  className={`flex-1 min-w-[100px] rounded-xl border-2 py-3 px-4 text-sm font-bold transition-all ${
                    confidenceRating === "incorrect"
                      ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                      : "border-slate-100 bg-slate-50 text-slate-600 hover:border-red-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                  }`}
                >
                  {createReviewMutation.isPending &&
                  confidenceRating === "incorrect"
                    ? "Saving..."
                    : "Wrong"}
                </button>
                <button
                  type="button"
                  disabled={createReviewMutation.isPending}
                  onClick={() => handleSubmitReview("unknown")}
                  className={`flex-1 min-w-[100px] rounded-xl border-2 py-3 px-4 text-sm font-bold transition-all ${
                    confidenceRating === "unknown"
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400"
                      : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                  }`}
                >
                  {createReviewMutation.isPending &&
                  confidenceRating === "unknown"
                    ? "Saving..."
                    : "UnSure"}
                </button>
              </div>
            </div>
          )}

          {/* Bottom progress flow */}
          {chapterFlashcards.length > 0 && (
            <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
              <div className="overflow-x-auto pb-1">
                <div className="relative mx-1 min-w-max px-2 pt-2">
                  <div className="absolute left-2 right-2 top-1/2 h-px -translate-y-1/2 bg-slate-300 dark:bg-slate-600" />
                  <div className="relative flex items-center gap-2">
                    {chapterFlashcards.map((card, index) => {
                      const isCurrent = card._id === lastid;
                      return (
                        <button
                          key={card._id}
                          type="button"
                          onClick={() => goToFlashcardByIndex(index)}
                          aria-label={`Go to flashcard ${index + 1}`}
                          title={`Flashcard ${index + 1}`}
                          className={`relative -top-1 h-3 w-3 rounded-full border transition-all ${
                            isCurrent
                              ? "border-orange-700 bg-orange-700 shadow-sm dark:border-orange-400 dark:bg-orange-400"
                              : "border-slate-300 bg-white hover:border-orange-400 dark:border-slate-500 dark:bg-slate-900"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => goToFlashcardByIndex(currentIndex - 1)}
                    disabled={currentIndex <= 0}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                    title="Previous Flashcard"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {chapter} - Flashcard {currentStep} of {safeTotalFlashcards}
                  </p>
                  <button
                    type="button"
                    onClick={() => goToFlashcardByIndex(currentIndex + 1)}
                    disabled={currentIndex >= chapterFlashcards.length - 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                    title="Next Flashcard"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {filteredFlashcards > 0 &&
                  filteredFlashcards !== safeTotalFlashcards
                    ? `${filteredFlashcards} from filtered results`
                    : `${safeTotalFlashcards} flashcards`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashCardDetails;
