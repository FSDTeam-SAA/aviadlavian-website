"use client";
import React, { useState } from "react";
import { Shuffle, FileText, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type Topic = {
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
};

type QuestionBankResponse = {
  message: string;
  statusCode: number;
  status: string;
  data: {
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPage: number;
    };
    data: Topic[];
  };
};

const QuestionBank = () => {
  const session = useSession();
  const token = session.data?.accessToken || null;
  const router = useRouter();

  const [page, setPage] = useState(1);

  const { data, isLoading, error, isError } = useQuery<QuestionBankResponse>({
    queryKey: ["questionBank", page],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/questionbank/question-bank-entry?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) throw new Error("Failed to fetch question bank");

      return res.json();
    },
  });

  const topics = data?.data?.data || [];
  const meta = data?.data?.meta;

  const handelNavigate = (topic: string) => {
    router.push(`/questionbank/${topic}`);
  };

  if (isLoading) return <p className="p-10">Loading...</p>;
  if (isError) return <p className="p-10">Error: {(error as Error).message}</p>;

  return (
    <div className="min-h-screen bg-[#FDFCFE] p-4 md:p-10 text-[#1A1A1A]">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Question Bank</h1>

        <nav className="flex items-center gap-2 text-sm font-semibold">
          <span className="text-[#6B21A8]">Question Bank</span>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="text-slate-600 font-medium text-xs">
            All MSK NEXUS Question Banks
          </span>
        </nav>
      </header>

      {/* Shuffle */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 mb-6 flex justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-slate-50 rounded-lg">
            <Shuffle size={20} />
          </div>

          <div>
            <h2 className="font-bold text-lg">Shuffle Questions</h2>
            <p className="text-sm text-slate-500">
              Answer questions randomly across the question bank.
            </p>
          </div>
        </div>

        <button className="bg-[#6B21A8] text-white px-5 py-2.5 rounded-lg font-bold text-sm">
          Show Question Paper
        </button>
      </div>

      {/* Topic List */}
      <div className="space-y-3">
        {topics.map((item) => (
          <div
            key={item.topicId}
            onClick={() => handelNavigate(item.topicId)}
            className="flex cursor-pointer flex-col lg:flex-row items-start lg:items-center justify-between p-5 rounded-xl border border-slate-100 shadow-sm bg-white hover:shadow-md transition"
          >
            <div className="flex items-center gap-4 w-full lg:w-1/3">
              <div className="w-10 h-10 rounded-full bg-slate-300" />

              <h3 className="font-semibold text-[15px] text-slate-800">
                {item.topicId}
              </h3>
            </div>

            {/* Right */}
            <div className="flex flex-col sm:flex-row flex-1 items-start sm:items-center gap-4 lg:gap-8 w-full mt-4 lg:mt-0">
              <div className="flex items-center gap-2 text-[#6B21A8] font-bold text-sm">
                <FileText size={18} />
                <span>{item.totalQuestions} MCQs</span>
              </div>

              {/* Progress */}
              <div className="flex-1 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6B21A8]"
                  style={{ width: `${item.completionPercentage}%` }}
                />
              </div>

              <div className="text-sm font-semibold text-slate-700">
                {item.completionPercentage}% answers corrected
              </div>

              <div className="text-sm font-semibold text-slate-700">
                Total {item.totalQuestions} Questions
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center gap-4 mt-10">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>

        <span className="font-semibold">
          Page {meta?.page} of {meta?.totalPage}
        </span>

        <button
          disabled={page === meta?.totalPage}
          onClick={() => setPage((prev) => prev + 1)}
          className="px-4 py-2 bg-[#6B21A8] text-white rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default QuestionBank;
