"use client";

import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Option = {
  _id: string;
  text: string;
  isCorrect: boolean;
  selectedCount: number;
};

type QuestionDetail = {
  _id: string;
  articleId: string;
  topicId: string;
  questionText: string;
  options: Option[];
  explanation: string;
  marks: number;
  totalAttempts: number;
  correctAttempts: number;
  isHidden: boolean;
  isDeleted: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  isAttempted: boolean;
  nextQuestionId?: string;
  optionStats?: Option[];
};

type QuestionResponse = {
  message: string;
  statusCode: number;
  status: string;
  data: QuestionDetail;
};

const QuestionExplanation = ({ qsid }: { qsid: string }) => {
  const session = useSession();
  const token = session.data?.accessToken || "";
  const queryClient = useQueryClient();
  const router = useRouter();

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // Fetch Question
  const { data, isLoading, error } = useQuery<QuestionResponse>({
    queryKey: ["question", qsid],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/questionbank/questions/${qsid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch question");
      return res.json();
    },
  });

  // Mutation to submit answer
  const submitAnswerMutation = useMutation({
    mutationFn: async (optionId: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/questionbank/questions/${qsid}/attempt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ selectedOptionId: optionId }),
        },
      );
      if (!res.ok) throw new Error("Failed to submit answer");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["question", qsid] });
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading question</p>;

  const question = data?.data;

  const handleOptionClick = (optionId: string) => {
    if (!selectedOptionId && !question?.isAttempted) {
      setSelectedOptionId(optionId);
      submitAnswerMutation.mutate(optionId);
    }
  };

  const handleNext = () => {
    if (question?.nextQuestionId && question.topicId) {
      router.push(
        `/questionbank/${question.topicId}/${question.nextQuestionId}`,
      );
    }
  };

  const handlePrevious = () => {
    router.back(); // Goes back to previous page
  };

  return (
    <div className="min-h-screen bg-[#FDFCFE] p-4 md:p-10 font-sans text-[#1A1A1A]">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm font-semibold mb-6">
        <span className="text-[#6B21A8]">Question Bank</span>
        <ChevronRight size={14} className="text-slate-400" />
        <span className="text-[#6B21A8]">{question?.topicId}</span>
        <ChevronRight size={14} className="text-slate-400" />
        <span className="text-[#6B21A8]">Question {question?._id}</span>
      </nav>

      {/* Question */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">{question?.questionText}</h1>

        <div className="space-y-3 max-w-sm">
          {question?.options.map((opt) => {
            const isSelected =
              selectedOptionId === opt._id || question?.isAttempted;
            const isCorrect = opt.isCorrect;

            return (
              <button
                key={opt._id}
                onClick={() => handleOptionClick(opt._id)}
                disabled={!!selectedOptionId || question?.isAttempted}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-sm font-medium
                  ${
                    isSelected
                      ? isCorrect
                        ? "bg-green-100 border-green-500 text-green-700"
                        : "bg-red-100 border-red-500 text-red-700"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
              >
                <span
                  className={`flex items-center justify-center w-6 h-6 rounded-full border text-xs
                    ${
                      isSelected
                        ? isCorrect
                          ? "border-green-500 text-green-500"
                          : "border-red-500 text-red-500"
                        : "border-slate-300 text-slate-500"
                    }`}
                >
                  {opt.text[0]}
                </span>
                {opt.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanation */}
      {question?.isAttempted && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">Explanation:</h2>
          <p className="text-sm leading-relaxed text-slate-700">
            {question.explanation}
          </p>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handlePrevious}
          className="px-10 py-2 border border-slate-200 rounded-lg font-bold text-sm text-[#6B21A8] bg-white hover:bg-slate-50 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={!question?.nextQuestionId}
          className="px-10 py-2 bg-[#6B21A8] border border-[#6B21A8] text-white rounded-lg font-bold text-sm hover:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default QuestionExplanation;
