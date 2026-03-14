// src/features/learningplan/component/DetailedLearning.tsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  Brain,
  Layers,
  Zap,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Circle,
} from "lucide-react";
import {
  PopulatedFlashcard,
  PopulatedQuiz,
  PopulatedArticle,
  Note,
  Highlight,
  LearningPlan,
} from "../types/learningplan.types";
import {
  useLearningPlan,
  useUpdateFlashcard,
  useUpdateArticleStatus,
  useGetMCQs,
  useAnnotations,
} from "../hooks/useLearningPlan";
import {
  findBodyRegion,
  groupArticlesBySecondaryRegion,
  getTopicFlashcards,
  getTopicQuizzes,
  getTopicArticles,
} from "../utils/learningplanHelpers";
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

// ── Annotation Components for Detailed View ──
const ArticleAnnotationsSummary = ({
  article,
  index,
}: {
  article: PopulatedArticle;
  index: number;
}) => {
  const { data, isLoading } = useAnnotations(article.articleId._id);
  const notes = data?.data?.notes || [];
  const highlights = data?.data?.highlights || [];

  if (isLoading)
    return (
      <div className="h-40 animate-pulse bg-slate-50 dark:bg-slate-800/40 rounded-xl mb-6" />
    );
  if (notes.length === 0 && highlights.length === 0) return null;

  return (
    <div className="space-y-6 mb-12 last:mb-0">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <span className="bg-slate-200 dark:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center text-xs">
            {(index + 1).toString().padStart(2, "0")}
          </span>
          {article.articleId.name}
        </h5>
        <div className="flex gap-2">
          {notes.length > 0 && (
            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
              {notes.length} Notes
            </span>
          )}
          {highlights.length > 0 && (
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
              {highlights.length} Highlights
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pl-4">
        {/* Notes column */}
        <div className="space-y-4">
          <h6 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3 h-3" /> Notes
          </h6>
          {notes.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              No notes for this article.
            </p>
          ) : (
            notes.map((note: Note) => (
              <div
                key={note.id}
                className="p-4 bg-amber-50/50 dark:bg-amber-900/10 border-l-4 border-amber-400 rounded-r-lg shadow-sm"
              >
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {note.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Highlights column */}
        <div className="space-y-4">
          <h6 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3" /> Highlights
          </h6>
          {highlights.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              No highlights for this article.
            </p>
          ) : (
            highlights.map((hl: Highlight) => (
              <div
                key={hl.id}
                className="p-4 bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-lg shadow-sm"
              >
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2 italic">
                  &quot;{hl.text}&quot;
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: hl.color }}
                  />
                  <span className="text-[10px] text-slate-500 font-medium">
                    Annotation Highlight
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const DetailedAnnotationsView = ({
  decodedRegion,
  topicName,
  articles,
  onBack,
}: {
  decodedRegion: string;
  topicName: string;
  articles: PopulatedArticle[];
  onBack: () => void;
}) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 transition-all duration-500">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          {decodedRegion}
        </h2>
        <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6">
          {topicName}
        </h3>

        <div className="mt-8">
          <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
            Notes & Highlights
          </h4>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Study Review
          </p>
        </div>
      </div>

      <div className="space-y-0">
        {articles.length === 0 ? (
          <p className="text-slate-500 italic py-10 text-center">
            No articles available to review.
          </p>
        ) : (
          articles.map((art, index) => (
            <ArticleAnnotationsSummary
              key={art._id}
              article={art}
              index={index}
            />
          ))
        )}
      </div>

      <div className="pt-10 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={onBack}
          className="text-lg font-bold text-[#0077A3] hover:text-[#005f82] transition-colors flex items-center gap-2"
        >
          ← Back to Topic Overview
        </button>
      </div>
    </div>
  );
};

// ── Annotation Item Component ──
const AnnotationItem = ({
  articleId,
  title,
  type,
}: {
  articleId: string;
  title: string;
  type: "notes" | "highlights";
}) => {
  const { data, isLoading } = useAnnotations(articleId);
  const [isExpanded, setIsExpanded] = useState(false);

  const items =
    type === "notes" ? data?.data?.notes || [] : data?.data?.highlights || [];
  const count = items.length;

  if (isLoading)
    return <div className="h-10 animate-pulse bg-slate-50 rounded mb-2" />;

  return (
    <div className="border-b border-slate-50 dark:border-slate-800 last:border-0">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex justify-between items-center py-3 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/20 px-1 rounded transition-colors"
      >
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-400" /> {title}
        </span>
        <span className="text-sm text-slate-500 flex items-center gap-1">
          {count} {type.charAt(0).toUpperCase() + type.slice(1)}{" "}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </span>
      </div>

      {isExpanded && (
        <div className="pl-6 pb-4 space-y-3">
          {items.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              No {type} yet for this article.
            </p>
          ) : (
            items.map((item: Note | Highlight) => (
              <div
                key={item.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800"
              >
                {type === "notes" ? (
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {(item as Note).content}
                  </p>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      &quot;{(item as Highlight).text}&quot;
                    </p>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: (item as Highlight).color }}
                      />
                      <span className="text-[10px] text-slate-500">
                        Highlighted
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ── Main Component ──
const DetailedLearning = ({ bodyRegion, topicId }: DetailedLearningProps) => {
  const { data, isLoading, error } = useLearningPlan();
  const { mutate: updateArticle, isPending: isUpdatingArticle } =
    useUpdateArticleStatus();
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const isDetailsView = view === "details";
  const isAnnotationsView = view === "annotations";

  // MCQ Data Fetching
  const { data: rawMcqData } = useGetMCQs(topicId);
  const mcqData = rawMcqData as unknown as MCQDataResponse;

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
    (f) =>
      f.isAnswered === "answered" ||
      f.isAnswered === "correct" ||
      f.isAnswered === "incorrect" ||
      f.isAnswered === "unsure",
  ).length;
  const flashcardsTotal = flashcards.length;

  const allArticles = React.useMemo(() => {
    return Object.values(groupedArticles).flat();
  }, [groupedArticles]);

  const articlesDone = allArticles.filter(
    (art) => art.isRead === "read",
  ).length;
  const articlesTotal = allArticles.length;

  // 5. Derive MCQs Data from Quizzes in Learning Plan
  const quizzes: PopulatedQuiz[] = React.useMemo(() => {
    return getTopicQuizzes(plans, topicId);
  }, [plans, topicId]);

  const mcqsTotal = quizzes.length;
  // mcqsDone for Progress Bar: how many unique questions were attempted at least once?
  const mcqsDone = quizzes.filter(
    (q) => (q.quizId.totalAttempts || 0) > 0 || q.isAnswered !== "unanswered",
  ).length;

  // Detailed Stats from aggregate attempts
  const totalCorrectAttempts = quizzes.reduce(
    (acc, q) => acc + (q.quizId.correctAttempts || 0),
    0,
  );
  const totalAttemptsMade = quizzes.reduce(
    (acc, q) => acc + (q.quizId.totalAttempts || 0),
    0,
  );
  const totalIncorrectAttempts = totalAttemptsMade - totalCorrectAttempts;

  const mcqStats = React.useMemo(
    () => ({
      correctCount: totalCorrectAttempts,
      incorrectCount: totalIncorrectAttempts,
      // Accuracy is calculated as (correct / total attempts made)
      correctPercentage:
        totalAttemptsMade > 0
          ? Math.round((totalCorrectAttempts / totalAttemptsMade) * 100)
          : 0,
      incorrectPercentage:
        totalAttemptsMade > 0
          ? Math.round((totalIncorrectAttempts / totalAttemptsMade) * 100)
          : 0,
      totalAttempts: totalAttemptsMade, // Extra field for the modal to use
    }),
    [totalCorrectAttempts, totalAttemptsMade, totalIncorrectAttempts],
  );

  const mcqQuestions = React.useMemo(() => {
    return quizzes.map((q, index) => ({
      serialNumber: index + 1,
      _id: q.quizId._id,
      questionText: q.quizId.questionText,
      explanation: q.quizId.explanation || "",
      isAttempted:
        (q.quizId.totalAttempts || 0) > 0 || q.isAnswered !== "unanswered",
      options: q.quizId.options.map((opt) => ({
        optionId: opt._id,
        text: opt.text,
        selectedCount: opt.selectedCount || 0,
        isCorrect: opt.isCorrect,
      })),
    }));
  }, [quizzes]);

  const handleMarkAsRead = (planId: string, articleId: string) => {
    if (!planId || !articleId) return;
    updateArticle({ planId, articleId, status: "read" });
  };

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
        {isDetailsView ? (
          <Link
            href={`/learningplan/${encodeURIComponent(decodedRegion.toLowerCase())}/${topicId}`}
            className="text-[#0077A3] hover:underline font-medium"
          >
            {topicName}
          </Link>
        ) : (
          <span className="text-slate-700 font-medium dark:text-slate-300">
            {topicName}
          </span>
        )}
        {(isDetailsView || isAnnotationsView) && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-700 font-medium dark:text-slate-300">
              {isDetailsView ? "Details" : "Notes & Highlights"}
            </span>
          </>
        )}
      </div>

      {isDetailsView ? (
        <div className="space-y-8 animate-in fade-in transition-all duration-500">
          {/* Details Heading */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              {decodedRegion}
            </h2>
            <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6">
              {topicName}
            </h3>

            <div className="mt-8">
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                Learning Plan
              </h4>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Details
              </p>
            </div>
          </div>

          {/* Articles List */}
          <div className="space-y-10">
            {allArticles.length === 0 ? (
              <p className="text-slate-500">No article details available.</p>
            ) : (
              allArticles.map((art, index) => (
                <div key={art._id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-900 dark:text-white">
                      Learning Plan {(index + 1).toString().padStart(2, "0")}
                    </h5>
                    {art.isRead === "read" ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full dark:bg-teal-900/30 dark:text-teal-400">
                        <CheckCircle className="w-3 h-3" /> COMPLETED
                      </span>
                    ) : (
                      <button
                        onClick={() =>
                          handleMarkAsRead(art.planId || "", art._id)
                        }
                        disabled={isUpdatingArticle}
                        className="text-xs font-bold text-[#0077A3] hover:text-[#005f82] transition-colors bg-white border border-[#0077A3] px-3 py-1 rounded-sm disabled:opacity-50"
                      >
                        {isUpdatingArticle ? "Marking..." : "Mark as Read"}
                      </button>
                    )}
                  </div>
                  <div
                    className="text-slate-700 dark:text-slate-300 leading-relaxed prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: String(art.articleId?.description || ""),
                    }}
                  />
                </div>
              ))
            )}
          </div>

          {/* Related Question Link */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() =>
                router.push(
                  `/learningplan/${encodeURIComponent(decodedRegion.toLowerCase())}/${topicId}`,
                )
              }
              className="text-lg font-bold text-slate-900 dark:text-white hover:text-[#0077A3] transition-colors"
            >
              Related Question
            </button>
          </div>
        </div>
      ) : isAnnotationsView ? (
        <DetailedAnnotationsView
          decodedRegion={decodedRegion}
          topicName={topicName}
          articles={allArticles}
          onBack={() =>
            router.push(
              `/learningplan/${encodeURIComponent(decodedRegion.toLowerCase())}/${topicId}`,
            )
          }
        />
      ) : (
        <>
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
              <div className="w-32">
                <ProgressBar
                  done={articlesDone}
                  total={articlesTotal}
                  color="bg-teal-500"
                  trackColor="bg-slate-200"
                />
              </div>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4 dark:border-slate-800">
              <p className="text-xs text-slate-500">
                Study the core materials to master this topic.
              </p>
              <span className="text-xs text-slate-500 text-right">
                {articlesTotal > 0
                  ? Math.round((articlesDone / articlesTotal) * 100)
                  : 0}
                % completed
              </span>
            </div>

            {Object.keys(groupedArticles).length === 0 ? (
              <p className="text-slate-500 text-sm py-4">
                No topic outline articles available.
              </p>
            ) : (
              <div className="space-y-2">
                {Object.entries(groupedArticles).map(
                  ([secRegion, articles]: [string, PopulatedArticle[]]) => (
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
                            className="flex items-center justify-between py-1"
                          >
                            <div
                              onClick={() =>
                                router.push(
                                  `/learningplan/${encodeURIComponent(decodedRegion.toLowerCase())}/${topicId}?view=details`,
                                )
                              }
                              className={`text-sm flex items-center gap-2 cursor-pointer transition-colors ${art.isRead === "read" ? "text-teal-600 font-medium" : "text-slate-600 dark:text-slate-400 hover:text-[#0077A3]"}`}
                            >
                              {art.isRead === "read" ? (
                                <CheckCircle className="w-3.5 h-3.5 text-teal-500" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-slate-300" />
                              )}
                              {art.articleId?.name || "Untitled Article"}
                            </div>
                            {art.isRead !== "read" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(art.planId || "", art._id);
                                }}
                                disabled={isUpdatingArticle}
                                className="text-[10px] font-bold text-[#0077A3] hover:underline disabled:opacity-50"
                              >
                                {isUpdatingArticle ? "..." : "Mark Read"}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </details>
                  ),
                )}
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
                choose the most appropriate response for how well you feel you
                know the answer.
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
                    planId={fc.planId || ""}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  Notes
                </h2>
                <button
                  onClick={() =>
                    router.push(
                      `/learningplan/${encodeURIComponent(decodedRegion.toLowerCase())}/${topicId}?view=annotations`,
                    )
                  }
                  className="text-xs font-bold text-[#0077A3] hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="space-y-1">
                {allArticles.map((art) => (
                  <AnnotationItem
                    key={`note-${art._id}`}
                    articleId={art.articleId._id}
                    title={art.articleId.name || "Untitled Article"}
                    type="notes"
                  />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  Highlights
                </h2>
                <button
                  onClick={() =>
                    router.push(
                      `/learningplan/${encodeURIComponent(decodedRegion.toLowerCase())}/${topicId}?view=annotations`,
                    )
                  }
                  className="text-xs font-bold text-[#0077A3] hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="space-y-1">
                {allArticles.map((art) => (
                  <AnnotationItem
                    key={`highlight-${art._id}`}
                    articleId={art.articleId._id}
                    title={art.articleId.name || "Untitled Article"}
                    type="highlights"
                  />
                ))}
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
        </>
      )}
    </div>
  );
};

export default DetailedLearning;
