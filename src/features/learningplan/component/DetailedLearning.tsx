// src/features/learningplan/component/DetailedLearning.tsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Brain,
  Layers,
  Zap,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  useLearningPlan,
  useUpdateFlashcard,
  useGetMCQs,
} from "../hooks/useLearningPlan";
import {
  findBodyRegion,
  groupArticlesBySecondaryRegion,
  getTopicFlashcards,
} from "../utils/learningplanHelpers";
import { PopulatedFlashcard } from "../types/learningplan.types";
import MCQStatsModal from "./MCQStatsModal";

interface DetailedLearningProps {
  bodyRegion: string;
  topicId: string;
}

interface MCQDataResponse {
  success: boolean;
  data: {
    topicId: string;
    totalQuestions: number;
    attemptedCount: number;
    completionPercentage: number;
    stats: {
      correctCount: number;
      incorrectCount: number;
      correctPercentage: number;
      incorrectPercentage: number;
    };
    questions: unknown[];
  };
}

// ── Progress Bar Component ──
const ProgressBar = ({
  done,
  total,
  color = "bg-[#0077A3]",
  trackColor = "bg-slate-200",
}: {
  done: number;
  total: number;
  color?: string;
  trackColor?: string;
}) => {
  const pct = total > 0 ? (done / total) * 100 : 0;
  return (
    <div className={`h-3 w-full rounded-full ${trackColor} dark:bg-slate-700`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

// ── Flashcard Item Component ──
const FlashcardItem = ({
  planId,
  flashcard,
}: {
  planId: string;
  flashcard: PopulatedFlashcard;
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const { mutate, isPending } = useUpdateFlashcard();

  const questionText =
    flashcard.flashcardId?.question || "Question not available";
  const answerText = flashcard.flashcardId?.answer || "Answer not available";

  const handleConfidenceRating = (
    status: "correct" | "incorrect" | "unsure",
  ) => {
    mutate({
      planId,
      flashcardId: flashcard.flashcardId._id,
      status,
    });
  };

  return (
    <div className="mb-6 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
      {/* Top Section: Question */}
      <div className="bg-[#feede0] p-8 flex flex-col items-center text-center">
        <div className="text-[#a46023] mb-4">
          {/* Heart/Beat custom icon representation based on design */}
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            <path
              d="M12 5 9.04 7.96a2.1 2.1 0 0 0 0 2.97l2.46 2.47a2.1 2.1 0 0 0 2.97 0l2.46-2.47a2.1 2.1 0 0 0 0-2.97L12 5Z"
              fill="currentColor"
            />
            <path d="M3.5 12h3l2-3 3 7 2-3h4" />
          </svg>
        </div>
        <p className="text-[#a46023] font-medium text-lg max-w-2xl leading-relaxed">
          {questionText}
        </p>
      </div>

      {/* Bottom Section: Answer / Reveal Button */}
      <div
        className={`p-8 flex flex-col items-center justify-center transition-colors min-h-[160px] ${showAnswer ? "bg-white" : "bg-[#eef6fd]"}`}
      >
        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="text-[#0077A3] font-bold text-xl hover:underline"
          >
            Reveal Answer
          </button>
        ) : (
          <div className="w-full text-center">
            <p className="text-slate-800 font-medium text-lg max-w-2xl mx-auto leading-relaxed mb-8">
              {answerText}
            </p>

            <div className="border-t border-slate-200 pt-6 mt-4 text-left w-full">
              <p className="text-slate-700 font-medium mb-4">
                Rate your confidence. Did you know the answer?
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => handleConfidenceRating("correct")}
                  disabled={isPending}
                  className={`px-6 py-2 rounded-full border border-teal-500 text-teal-600 font-medium hover:bg-teal-50 transition-colors ${flashcard.isAnswered === "correct" ? "bg-teal-100" : ""}`}
                >
                  Correct
                </button>
                <button
                  onClick={() => handleConfidenceRating("incorrect")}
                  disabled={isPending}
                  className={`px-6 py-2 rounded-full border border-red-500 text-red-500 font-medium hover:bg-red-50 transition-colors ${flashcard.isAnswered === "incorrect" ? "bg-red-100" : ""}`}
                >
                  Incorrect
                </button>
                <button
                  onClick={() => handleConfidenceRating("unsure")}
                  disabled={isPending}
                  className={`px-6 py-2 rounded-full border border-[#cbab58] text-[#b38e36] font-medium hover:bg-yellow-50 transition-colors ${flashcard.isAnswered === "unsure" ? "bg-amber-100" : ""}`}
                >
                  Unsure
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Component ──
const DetailedLearning = ({ bodyRegion, topicId }: DetailedLearningProps) => {
  const { data, isLoading, error } = useLearningPlan();

  // MCQ Data Fetching
  const { data: rawMcqData } = useGetMCQs(topicId);

  const mcqData = rawMcqData as MCQDataResponse;

  const [isMCQModalOpen, setIsMCQModalOpen] = useState(false);

  const decodedRegion = decodeURIComponent(bodyRegion);

  // 1. Get Top-Level Data
  const plans = React.useMemo(() => data?.data || [], [data?.data]);

  // 2. Derive Header Info
  const regionGroup = React.useMemo(() => {
    return findBodyRegion(plans, decodedRegion);
  }, [plans, decodedRegion]);

  const totalChapters = regionGroup?.chapterCount || 0;
  const topic = regionGroup?.topics.find((t) => t._id === topicId);
  const topicName = topic?.Name || "Topic Details";
  const topicImage =
    topic?.Image_URL || regionGroup?.imageUrl || "https://placehold.co/48x48";

  // 3. Derive Topic Outline (Grouped Articles)
  const groupedArticles = React.useMemo(() => {
    return groupArticlesBySecondaryRegion(plans, decodedRegion);
  }, [plans, decodedRegion]);

  // 4. Derive Flashcards Data
  const flashcards = React.useMemo(() => {
    return getTopicFlashcards(plans, topicId);
  }, [plans, topicId]);

  const flashcardsDone = flashcards.filter(
    (f) => f.isAnswered === "answered",
  ).length;
  const flashcardsTotal = flashcards.length;

  // 5. Derive MCQs Data (IsAnswered)
  // According to instruction: progress = (answered / total) * 100
  // Derived from mcqData
  const mcqsTotal = mcqData?.data?.totalQuestions || 0;
  const mcqsDone = mcqData?.data?.attemptedCount || 0;
  const mcqStats = mcqData?.data?.stats;
  const mcqQuestions = mcqData?.data?.questions || [];

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-slate-950 min-h-screen">
        <div className="h-8 w-64 bg-slate-200 animate-pulse rounded mb-4" />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 rounded-xl bg-white dark:bg-slate-900 shadow-sm animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-slate-950 min-h-screen">
        <p className="text-red-500">Error loading topic details.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-slate-950 min-h-screen font-sans">
      {/* Page Title & Breadcrumb */}
      <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
        Learning Plan
      </h1>

      <div className="mb-6 flex items-center flex-wrap gap-1 text-sm text-slate-500 dark:text-slate-400">
        <Link
          href="/learningplan"
          className="text-[#0077A3] hover:underline font-medium"
        >
          Learning Plan
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link
          href={`/learningplan/${encodeURIComponent(decodedRegion.toLowerCase())}`}
          className="text-[#0077A3] hover:underline font-medium"
        >
          {decodedRegion}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-700 font-medium dark:text-slate-300">
          {topicName}
        </span>
      </div>

      {/* 1. Header Card */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm mb-6 flex items-center gap-4 dark:bg-slate-900 dark:border-slate-800">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
          <img
            src={topicImage}
            alt={decodedRegion}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
            {decodedRegion}
          </h3>
          <p className="text-sm text-slate-500 font-medium">
            {totalChapters} Chapters
          </p>
        </div>
      </div>

      {/* 2. MCQ Progress */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm mb-6 dark:bg-slate-900 dark:border-slate-800">
        <h2 className="font-semibold text-lg mb-4 text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#0077A3]" /> MCQs
        </h2>

        <div className="mb-3">
          <p className="text-sm text-slate-500 mb-2 font-medium">
            Your Progress
          </p>
          <ProgressBar
            done={mcqsDone}
            total={mcqsTotal}
            color="bg-teal-500"
            trackColor="bg-slate-200"
          />
        </div>

        <p className="text-sm text-slate-600 mb-4 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="font-bold text-[#0077A3]">
            {mcqStats?.correctPercentage || 0}% correct
          </span>{" "}
          of {mcqsTotal} questions completed
        </p>

        <button
          onClick={() => setIsMCQModalOpen(true)}
          className="bg-[#0077A3] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#005f82] transition-colors"
        >
          View Topic Questions
        </button>
      </div>

      {/* 3. Topic Outline (Articles by Secondary Region) */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm mb-6 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#0077A3]" /> Topic Outline
          </h2>
        </div>

        {Object.keys(groupedArticles).length === 0 ? (
          <p className="text-slate-500 text-sm py-4">
            No topic outline articles available.
          </p>
        ) : (
          <div className="space-y-2">
            {Object.entries(groupedArticles).map(([secRegion, articles]) => (
              <details
                key={secRegion}
                className="group border-b border-slate-100 dark:border-slate-800 py-2 last:border-b-0"
              >
                <summary className="flex items-center justify-between cursor-pointer font-medium text-slate-800 dark:text-slate-200 hover:text-[#0077A3] transition-colors py-2 marker:content-none">
                  {secRegion}
                  <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="pl-4 pb-3 pt-1 space-y-2">
                  {articles.map((art) => (
                    <div
                      key={art._id}
                      className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2 cursor-pointer hover:text-[#0077A3]"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      {art.articleId?.name || "Untitled Article"}
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        )}
      </div>

      {/* 4. Flashcards */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm mb-6 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#0077A3]" /> Flashcards
          </h2>
          <div className="w-32">
            <ProgressBar
              done={flashcardsDone}
              total={flashcardsTotal}
              color="bg-teal-500"
              trackColor="bg-red-500"
            />
          </div>
        </div>
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4 dark:border-slate-800">
          <p className="text-xs text-slate-500 max-w-[60%]">
            Review flashcards related to {topicName}. Tap to reveal link and
            choose the most appropriate response for how well you feel you know
            the answer.
          </p>
          <span className="text-xs text-slate-500 text-right">
            {flashcardsTotal > 0
              ? Math.round((flashcardsDone / flashcardsTotal) * 100)
              : 0}
            % completed from {flashcardsTotal} flashcards
          </span>
        </div>

        {flashcards.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">
            No flashcards found for this topic.
          </p>
        ) : (
          <div className="space-y-4 pt-2">
            {flashcards.map((fc) => (
              <FlashcardItem
                key={fc._id}
                flashcard={fc}
                planId={plans[0]?._id}
              />
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button className="bg-[#0077A3] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#005f82] transition-colors">
            Show More Flashcards
          </button>
        </div>
      </div>

      {/* 5. Notes & Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <h2 className="font-semibold text-lg mb-4 text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Notes
          </h2>
          <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 py-3">
            <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" /> MSK Nexus Questions
              Banks
            </span>
            <span className="text-sm text-slate-500 flex items-center gap-1">
              0 Notes <ChevronDown className="w-4 h-4" />
            </span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" /> Clinical Cases
            </span>
            <span className="text-sm text-slate-500 flex items-center gap-1">
              0 Notes <ChevronDown className="w-4 h-4" />
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <h2 className="font-semibold text-lg mb-4 text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Highlights
          </h2>
          <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 py-3">
            <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" /> MSK Nexus Questions
              Banks
            </span>
            <span className="text-sm text-slate-500 flex items-center gap-1">
              0 Highlights <ChevronDown className="w-4 h-4" />
            </span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" /> Clinical Cases
            </span>
            <span className="text-sm text-slate-500 flex items-center gap-1">
              0 Highlights <ChevronDown className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>

      {/* MCQ Stats Modal */}
      <MCQStatsModal
        isOpen={isMCQModalOpen}
        onClose={() => setIsMCQModalOpen(false)}
        stats={mcqStats}
        totalQuestions={mcqsTotal}
        attemptedCount={mcqsDone}
        questions={mcqQuestions}
      />
    </div>
  );
};

export default DetailedLearning;
