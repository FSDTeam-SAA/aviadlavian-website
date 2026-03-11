"use client";

import React, { useState } from "react";
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
  const router = useRouter();
  const session = useSession();
  const token = session?.data?.accessToken;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  // Duplicate Quiz Mutation
  const duplicateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/examattempt/exam/${id}/duplicate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to duplicate quiz");
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast.success("Quiz duplicated successfully!", {
        description: "The quiz has been copied to your quizzes.",
        duration: 3000,
      });

      // Optionally redirect to the new quiz or refresh the list
      if (data?.data?._id) {
        router.push(`/custom-quizzes/${data?.data?._id}`);
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to duplicate quiz", {
        description: error.message || "Please try again later.",
        duration: 4000,
      });
    },
  });

  // Delete Quiz Mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/examattempt/delete/${id}`,
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

  const handleDuplicate = () => {
    duplicateMutation.mutate();
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

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
    <>
      <div className="p-8 bg-[#F9FAFB] min-h-screen">
        {/* Header Section */}
        <h1 className="text-2xl font-bold text-[#1F2937] mb-4">
          Custom Quizzes
        </h1>

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
                      MSK Nexus &gt; {summary?.topicId || "Gastroenterology"}{" "}
                      &gt; Question {item.serialNumber}
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
            onClick={handleDuplicate}
            disabled={duplicateMutation.isPending}
            className="px-8 py-2.5 bg-[#003580] text-white font-semibold rounded-lg text-sm hover:bg-[#002a66] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {duplicateMutation.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Duplicating...
              </>
            ) : (
              "Duplicate Quizzes"
            )}
          </button>
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
              "Delete Quizzes"
            )}
          </button>
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
                Delete Quiz
              </h3>

              {/* Message */}
              <p className="text-[#6B7280] text-center mb-6">
                Are you sure you want to delete this quiz? This action cannot be
                undone.
              </p>

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
      </div>
    </>
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
