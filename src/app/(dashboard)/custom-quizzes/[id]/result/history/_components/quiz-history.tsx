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
    topicId: string;
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

const QuizHistory = () => {
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

  if (isLoading) return <QuizHistorySkeleton />;
  if (error)
    return <div className="p-6 text-red-500">Error loading quiz history.</div>;

  const summary = data?.data.examSummary;
  const results = data?.data.detailedResults || [];

  // Logic for the progress bar
  const total = summary?.totalQuestions || 1;
  const correctPct = ((summary?.correctAnswers || 0) / total) * 100;
  const incorrectPct = ((summary?.incorrectAnswers || 0) / total) * 100;

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen">
      {/* Header Section */}
      <h1 className="text-2xl font-bold text-[#1F2937] mb-4">Custom Quizzes</h1>

      <div className="flex items-center gap-2 mb-1">
        <FileText className="w-6 h-6 text-[#0047AB]" />
        <span className="text-2xl font-bold text-[#0047AB]">
          {summary?.startedAt
            ? new Date(summary.startedAt).toLocaleDateString("en-GB")
            : "05/04/2025"}
        </span>
      </div>

      <p className="text-base text-[#374151] mb-6">Study Mode Quizzes</p>

      {/* Progress Section */}
      <div className="mb-8">
        <p className="text-sm font-medium text-[#374151] mb-2">Your Progress</p>
        <div className="w-full h-3 bg-slate-200 rounded-full flex overflow-hidden mb-2">
          <div
            className="h-full bg-[#047857]"
            style={{ width: `${correctPct}%` }}
          />
          <div
            className="h-full bg-[#EF4444]"
            style={{ width: `${incorrectPct}%` }}
          />
        </div>
        <p className="text-sm text-[#374151]">
          <span className="font-bold text-[#0047AB]">
            {summary?.scorePercentage}% corrected
          </span>{" "}
          of {summary?.totalQuestions} questions completed
        </p>
      </div>

      {/* Detailed Results List */}
      <div className="space-y-1">
        {results.map((item) => (
          <Link
            key={item.questionId}
            href={`/custom-quizzes/${id}/result/history/${item.questionId}`}
          >
            <div className="flex items-center justify-between p-3 bg-[#FDFDFD] border border-[#E5E7EB] rounded-lg hover:shadow-sm transition-all group cursor-pointer">
              <div className="flex items-center gap-4">
                {/* Question Number Box */}
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-md text-white font-bold text-xs ${item.isCorrect ? "bg-[#047857]" : "bg-[#EF4444]"}`}
                >
                  {item.serialNumber.toString().padStart(2, "0")}
                </div>

                {/* Question Text and Breadcrumb */}
                <div>
                  <h3 className="text-[#374151] font-medium text-sm">
                    Diagnose hereditary hemochromatosis
                  </h3>
                  <p className="text-[11px] text-[#6B7280] uppercase tracking-wide">
                    MSK Nexus &gt; {summary?.topicId || "Gastroenterology"} &gt;
                    Question {item.serialNumber}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-[#1F2937]" />
            </div>
          </Link>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-10">
        <button className="px-8 py-2.5 bg-[#003580] text-white font-semibold rounded-lg text-sm hover:bg-[#002a66] transition-colors">
          Duplicate Quizzes
        </button>
        <button className="px-8 py-2.5 bg-white text-[#EF4444] font-semibold rounded-lg text-sm border border-[#EF4444] hover:bg-red-50 transition-colors">
          Delete Quizzes
        </button>
      </div>
    </div>
  );
};

// --- Skeleton Loader ---
const QuizHistorySkeleton = () => (
  <div className="p-8 animate-pulse">
    <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
    <div className="h-10 w-64 bg-gray-200 rounded mb-8"></div>
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 w-full bg-gray-100 rounded-lg"></div>
      ))}
    </div>
  </div>
);

export default QuizHistory;
