"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FileText, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

// --- Types ---
interface Option {
  _id: string;
  text: string;
  isCorrect: boolean;
  selectedCount: number;
}

interface DetailedResult {
  serialNumber: number;
  questionId: string;
  questionText: string;
  explanation: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
  options: Option[];
}

interface ExamData {
  examSummary: {
    _id: string;
    examName: string;
    totalQuestions: number;
    attemptedQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    scorePercentage: number;
    startedAt: string;
  };
  detailedResults: DetailedResult[];
}

interface ApiResponse {
  data: ExamData;
}

// --- Component ---

const QuizResult = () => {
  const { id } = useParams();
  const session = useSession();
  const token = session?.data?.accessToken;

  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ["examResult", id],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/examattempt/${id}/result`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch results");
      return res.json();
    },
  });

  if (isLoading) return <QuizSkeleton />;
  if (error)
    return <div className="p-6 text-red-500">Error loading results.</div>;

  const summary = data?.data.examSummary;

  // Calculate percentages for the progress bar segments
  const total = summary?.totalQuestions || 1;
  const correctWidth = ((summary?.correctAnswers || 0) / total) * 100;
  const incorrectWidth = ((summary?.incorrectAnswers || 0) / total) * 100;

  return (
    <div className="p-6 bg-white min-h-screen ">
      <h2 className="text-xl font-semibold text-slate-800 mb-6">
        Quizzes in progress
      </h2>

      <Link href={`/custom-quizzes/${id}/result/history`}>
        <div className="space-y-4">
          {/* We map the summary into a card like the Figma layout */}
          <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer">
            {/* Left: Date and Mode */}
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <FileText className="w-5 h-5 text-slate-900" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {summary?.startedAt
                    ? new Date(summary.startedAt).toLocaleDateString("en-GB")
                    : "05/04/2025"}
                </p>
                <p className="text-sm text-slate-600">Exam Mode Quizzes</p>
              </div>
            </div>

            {/* Center: Progress and Stats */}
            <div className="flex-1 max-w-md lg:max-w-2xl px-8">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-slate-800">
                  Total {summary?.totalQuestions} Questions
                </span>
              </div>

              {/* Multi-segment Progress Bar */}
              <div className="w-full h-2 bg-slate-200 rounded-full flex overflow-hidden">
                <div
                  className="h-full bg-emerald-600"
                  style={{ width: `${correctWidth}%` }}
                />
                <div
                  className="h-full bg-red-500"
                  style={{ width: `${incorrectWidth}%` }}
                />
              </div>

              <p className="mt-1 text-sm text-slate-600 font-medium">
                {summary?.scorePercentage}% Correct of{" "}
                {summary?.attemptedQuestions} question completed
              </p>
            </div>

            {/* Right: Action */}
            <div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

// --- Skeleton Loader ---

const QuizSkeleton = () => (
  <div className="p-6 animate-pulse">
    <div className="h-6 w-48 bg-slate-200 rounded mb-6"></div>
    {[1, 2, 3].map((i) => (
      <div key={i} className="h-24 w-full bg-slate-100 rounded-lg mb-4"></div>
    ))}
  </div>
);

export default QuizResult;
