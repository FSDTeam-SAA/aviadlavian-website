// src/features/learningplan/component/SingleLearning.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLearningPlan, useAnnotations } from "../hooks/useLearningPlan";
import {
  findBodyRegion,
  getTopicProgress,
  getTopicArticles,
} from "../utils/learningplanHelpers";
import {
  TopicProgress,
  PopulatedArticle,
  LearningPlan,
} from "../types/learningplan.types";

interface SingleLearningProps {
  bodyRegion: string;
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
    <div className={`h-2 flex-1 rounded-full ${trackColor} dark:bg-slate-700`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

// ── Annotation Count Wrapper ──
const TopicAnnotationCounts = ({
  articles,
  type,
}: {
  articles: PopulatedArticle[];
  type: "notes" | "highlights";
}) => {
  return (
    <div className="flex items-center gap-1">
      {articles.map((art) => (
        <ArticleCountFetcher
          key={art._id}
          articleId={art.articleId._id}
          type={type}
        />
      ))}
    </div>
  );
};

const ArticleCountFetcher = ({
  articleId,
  type,
}: {
  articleId: string;
  type: "notes" | "highlights";
}) => {
  const { data } = useAnnotations(articleId);
  const count =
    type === "notes"
      ? data?.data?.notes?.length || 0
      : data?.data?.highlights?.length || 0;

  if (count === 0) return null;
  return (
    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-bold">
      {count}
    </span>
  );
};

// ── Topic Progress Card ──
const TopicProgressCard = ({
  progress,
  bodyRegion,
  plans,
}: {
  progress: TopicProgress;
  bodyRegion: string;
  plans: LearningPlan[];
}) => {
  const router = useRouter();
  const topicArticles = React.useMemo(
    () => getTopicArticles(plans, progress.topic._id),
    [plans, progress.topic._id],
  );

  console.log("clg", progress);

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Topic Name */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0077A3]/10">
          <svg
            className="h-4 w-4 text-[#0077A3]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          {progress.topic.Name}
        </h3>
      </div>

      {/* MCQs */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex w-36 items-center gap-2">
          <svg
            className="h-4 w-4 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            MCQs
          </span>
        </div>
        <ProgressBar
          done={progress.mcqs.done}
          total={progress.mcqs.total}
          color="bg-[#0077A3]"
        />
        <span className="w-48 text-right text-sm text-slate-500">
          {progress.mcqs.total > 0
            ? `${progress.mcqs.done} of ${progress.mcqs.total} questions answered`
            : "Not available yet"}
        </span>
      </div>

      {/* Topic Outline (Articles) */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex w-36 items-center gap-2">
          <svg
            className="h-4 w-4 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Topic Outline
          </span>
        </div>
        <ProgressBar
          done={progress.articles.done}
          total={progress.articles.total}
          color="bg-[#0077A3]"
        />
        <span className="w-48 text-right text-sm text-slate-500">
          {progress.articles.total > 0
            ? `${progress.articles.done} of ${progress.articles.total} Sections Mastered`
            : "No articles"}
        </span>
      </div>

      {/* Flashcards */}
      <div className="mb-5 flex items-center gap-4">
        <div className="flex w-36 items-center gap-2">
          <svg
            className="h-4 w-4 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Flashcards
          </span>
        </div>
        <ProgressBar
          done={progress.flashcards.done}
          total={progress.flashcards.total}
          color="bg-[#0077A3]"
        />
        <span className="w-48 text-right text-sm text-slate-500">
          {progress.flashcards.total > 0
            ? `${progress.flashcards.done} of ${progress.flashcards.total} flashcards answered`
            : "No flashcards"}
        </span>
      </div>

      {/* Notes */}
      <div
        onClick={() =>
          router.push(
            `/learningplan/${bodyRegion}/${progress.topic._id}?view=annotations`,
          )
        }
        className="mb-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 p-1 rounded transition-colors group"
      >
        <div className="flex w-36 items-center gap-2">
          <svg
            className="h-4 w-4 text-slate-500 group-hover:text-[#0077A3]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-[#0077A3]">
            Notes
          </span>
        </div>
        <div className="flex-1 flex gap-2">
          <TopicAnnotationCounts articles={topicArticles} type="notes" />
        </div>
      </div>

      {/* Highlights */}
      <div
        onClick={() =>
          router.push(
            `/learningplan/${bodyRegion}/${progress.topic._id}?view=annotations`,
          )
        }
        className="mb-5 flex items-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 p-1 rounded transition-colors group"
      >
        <div className="flex w-36 items-center gap-2">
          <svg
            className="h-4 w-4 text-slate-500 group-hover:text-[#0077A3]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-[#0077A3]">
            Highlights
          </span>
        </div>
        <div className="flex-1 flex gap-2">
          <TopicAnnotationCounts articles={topicArticles} type="highlights" />
        </div>
      </div>

      {/* View Details Button */}
      <div className="flex justify-center mt-2">
        <button
          onClick={() =>
            router.push(`/learningplan/${bodyRegion}/${progress.topic._id}`)
          }
          className="rounded-lg cursor-pointer bg-[#0077A3] px-5 py-2 text-sm font-medium text-white hover:bg-[#005f82] transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

// ── Main Component ──
const SingleLearning = ({ bodyRegion }: SingleLearningProps) => {
  const { data, isLoading, error } = useLearningPlan();
  const decodedRegion = decodeURIComponent(bodyRegion);

  const regionGroup = React.useMemo(() => {
    if (!data?.data) return undefined;
    return findBodyRegion(data.data, decodedRegion);
  }, [data, decodedRegion]);

  const topicProgressList = React.useMemo(() => {
    if (!data?.data) return [];
    return getTopicProgress(data.data, decodedRegion);
  }, [data, decodedRegion]);

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
            Learning Plan
          </h1>
          <div className="space-y-4 mt-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 rounded-xl bg-slate-100 animate-pulse dark:bg-slate-800"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
            Learning Plan
          </h1>
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950/20">
            <p className="text-red-600 dark:text-red-400">
              Failed to load learning plan. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const displayName = regionGroup?.region || decodedRegion;

  return (
    <div className="w-full">
      <div className="bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        {/* Header */}
        <h1 className="mb-1 text-3xl font-bold text-slate-900 dark:text-slate-100">
          Learning Plan
        </h1>

        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-1 text-sm">
          <Link
            href="/learningplan"
            className="text-[#0077A3] hover:underline font-medium"
          >
            Learning Plan
          </Link>
          <span className="text-slate-400">&gt;</span>
          <span className="text-[#0077A3] font-medium">{displayName}</span>
        </div>

        {/* Region Header Card */}
        <div className="mb-6 flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-100">
            <img
              src={regionGroup?.imageUrl || "https://placehold.co/48x48"}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">
              {displayName}
            </h3>
            <p className="text-sm text-slate-500">
              {regionGroup?.chapterCount || topicProgressList.length} Chapters
            </p>
          </div>
        </div>

        {/* Topic Progress Cards */}
        <div className="space-y-4">
          {topicProgressList.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800">
              <p className="text-slate-500 dark:text-slate-400">
                No topics found for this body region.
              </p>
            </div>
          ) : (
            topicProgressList.map((progress) => (
              <TopicProgressCard
                key={progress.topic._id}
                progress={progress}
                bodyRegion={encodeURIComponent(decodedRegion.toLowerCase())}
                plans={data?.data || []}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleLearning;
