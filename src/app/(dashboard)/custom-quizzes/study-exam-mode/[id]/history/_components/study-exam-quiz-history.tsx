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
  isAttempted: boolean;
  options: Option[];
}

interface QuizSummary {
  _id: string;
  quizName: string;
  topicIds: string[];
  mode: string;
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  scorePercentage: number;
  totalMarks: number;
  obtainedMarks: number;
  timeLimitMinutes: number;
  timeSpentSeconds: number;
  startedAt: string;
  submittedAt: string;
}

interface StudyExamData {
  quizSummary: QuizSummary;
  detailedResults: DetailedResult[];
}

interface ApiResponse {
  message: string;
  statusCode: number;
  status: string;
  data: StudyExamData;
}

const StudyExamQuizHistory = () => {
  const { id } = useParams();
  const session = useSession();
  const token = session?.data?.accessToken;

  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ["studyExamResult", id],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/quiz/${id}/result`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch study exam results");
      return res.json();
    },
  });

  if (isLoading) return <StudyExamQuizHistorySkeleton />;
  if (error)
    return (
      <div className="p-6 text-red-500">Error loading study exam history.</div>
    );

  const summary = data?.data.quizSummary;
  const results = data?.data.detailedResults || [];

  // Format time spent (seconds to minutes:seconds)
  const formatTimeSpent = (seconds: number = 0) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Logic for the progress bar
  const total = summary?.totalQuestions || 1;
  const correctPct = ((summary?.correctAnswers || 0) / total) * 100;
  const incorrectPct = ((summary?.incorrectAnswers || 0) / total) * 100;

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen">
      {/* Header Section */}
      <h1 className="text-2xl font-bold text-[#1F2937] mb-4">
        Study Mode Quizzes
      </h1>

      <div className="flex items-center gap-2 mb-1">
        <FileText className="w-6 h-6 text-[#0047AB]" />
        <span className="text-2xl font-bold text-[#0047AB]">
          {summary?.startedAt
            ? new Date(summary.startedAt).toLocaleDateString("en-GB")
            : "05/04/2025"}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-[#374151] mb-6">
        <p className="font-medium">{summary?.quizName || "Study Exam"}</p>
        <span>•</span>
        <p>Mode: {summary?.mode || "Exam"}</p>
        <span>•</span>
        <p>Time Spent: {formatTimeSpent(summary?.timeSpentSeconds)}</p>
        <span>•</span>
        <p>
          Marks: {summary?.obtainedMarks}/{summary?.totalMarks}
        </p>
      </div>

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
          of {summary?.totalQuestions} questions completed • Attempted:{" "}
          {summary?.attemptedQuestions}/{summary?.totalQuestions}
        </p>
      </div>

      {/* Detailed Results List */}
      <div className="space-y-1">
        {results.map((item) => (
          <Link
            key={item.questionId}
            href={`/study-exam/${id}/result/history/${item.questionId}`}
          >
            <div className="flex items-center justify-between p-3 bg-[#FDFDFD] border border-[#E5E7EB] rounded-lg hover:shadow-sm transition-all group cursor-pointer">
              <div className="flex items-center gap-4">
                {/* Question Number Box */}
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-md text-white font-bold text-xs ${item.isCorrect ? "bg-[#047857]" : item.isAttempted ? "bg-[#EF4444]" : "bg-[#9CA3AF]"}`}
                >
                  {item.serialNumber.toString().padStart(2, "0")}
                </div>

                {/* Question Text and Breadcrumb */}
                <div>
                  <h3 className="text-[#374151] font-medium text-sm">
                    {item.questionText.length > 50
                      ? `${item.questionText.substring(0, 50)}...`
                      : item.questionText}
                  </h3>
                  <p className="text-[11px] text-[#6B7280] uppercase tracking-wide">
                    {summary?.topicIds?.join(" > ") || "Study Exam"} &gt;
                    Question {item.serialNumber}
                    {!item.isAttempted && (
                      <span className="ml-2 text-[#EF4444]">
                        (Not Attempted)
                      </span>
                    )}
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
          Retake Quiz
        </button>
        <button className="px-8 py-2.5 bg-white text-[#EF4444] font-semibold rounded-lg text-sm border border-[#EF4444] hover:bg-red-50 transition-colors">
          Delete Results
        </button>
      </div>
    </div>
  );
};

// --- Skeleton Loader ---
const StudyExamQuizHistorySkeleton = () => (
  <div className="p-8 animate-pulse">
    <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
    <div className="h-10 w-64 bg-gray-200 rounded mb-4"></div>
    <div className="h-6 w-96 bg-gray-200 rounded mb-8"></div>
    <div className="h-4 w-full bg-gray-200 rounded mb-8"></div>
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 w-full bg-gray-100 rounded-lg"></div>
      ))}
    </div>
  </div>
);

export default StudyExamQuizHistory;
