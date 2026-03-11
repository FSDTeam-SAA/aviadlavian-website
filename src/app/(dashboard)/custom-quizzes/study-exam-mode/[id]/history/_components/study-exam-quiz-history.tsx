"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FileText, ChevronRight, AlertTriangle, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";

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
  const router = useRouter();
  const session = useSession();
  const token = session?.data?.accessToken;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ["studyExamResult", id],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/quiz/${id}/result?mode=exam`,
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

  // Delete Quiz Mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/quiz/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to delete quiz");
      }

      return res.json();
    },
    onSuccess: () => {
      toast.success("Quiz deleted successfully!", {
        description: "The quiz has been removed from your history.",
        duration: 3000,
      });

      setShowDeleteModal(false);
      // Redirect to study exams list or dashboard
      router.push("/custom-quizzes");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete quiz", {
        description: error.message || "Please try again later.",
        duration: 4000,
      });
      setShowDeleteModal(false);
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

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
    <>
      <div className="p-8 bg-[#F9FAFB] min-h-screen">
        {/* Header Section */}
        <h1 className="text-2xl font-bold text-[#1F2937] mb-4">
          Study Mode Quizzes
        </h1>

        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-6 h-6 text-[#0047AB]" />
          <span className="text-2xl font-bold text-[#0047AB]">
            {summary?.startedAt
              ? new Date(summary.startedAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "05/04/2025"}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-[#374151] mb-6 flex-wrap">
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
          <p className="text-sm font-medium text-[#374151] mb-2">
            Your Progress
          </p>
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
              href={`/custom-quizzes/study-exam-mode/${id}/history/${item.questionId}`}
            >
              <div className="flex items-center justify-between p-3 bg-[#FDFDFD] border border-[#E5E7EB] rounded-lg hover:shadow-sm transition-all group cursor-pointer">
                <div className="flex items-center gap-4">
                  {/* Question Number Box */}
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-md text-white font-bold text-xs ${
                      item.isCorrect
                        ? "bg-[#047857]"
                        : item.isAttempted
                          ? "bg-[#EF4444]"
                          : "bg-[#9CA3AF]"
                    }`}
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
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={deleteMutation.isPending}
            className="px-8 py-2.5 bg-white text-[#EF4444] font-semibold rounded-lg text-sm border border-[#EF4444] hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {deleteMutation.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-[#EF4444] border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Results"
            )}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 relative animate-fadeIn">
            {/* Close button */}
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Warning Icon */}
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-[#EF4444]" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-[#1F2937] text-center mb-2">
              Delete Quiz Results
            </h3>

            {/* Message */}
            <p className="text-[#6B7280] text-center mb-6">
              Are you sure you want to delete this quiz result? This action
              cannot be undone.
            </p>

            {/* Quiz Info (optional) */}
            {summary && (
              <div className="bg-gray-50 rounded-lg p-3 mb-6">
                <p className="text-sm text-[#374151] font-medium">
                  {summary.quizName}
                </p>
                <p className="text-xs text-[#6B7280] mt-1">
                  Score: {summary.scorePercentage}% • {summary.obtainedMarks}/
                  {summary.totalMarks} marks
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-[#374151] font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-[#EF4444] text-white font-medium rounded-lg hover:bg-[#DC2626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleteMutation.isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
