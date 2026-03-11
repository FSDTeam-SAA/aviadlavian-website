"use client";
import React from "react";
import { ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { QuestionsResponse } from "@/types/gettopicbyidqs";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const AllTopicQsAns = ({ topicId }: { topicId: string }) => {
  const router = useRouter();

  const session = useSession();
  const token = session.data?.accessToken || "";
  console.log(topicId);
  const { data, isLoading, error, isError } = useQuery<QuestionsResponse>({
    queryKey: ["questions", topicId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/questionbank/topics/${topicId}/questions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) throw new Error("Failed to fetch questions");

      return res.json();
    },
  });

  const questions = data?.data || [];

  const handelNavigate = (params: string) => {
    router.push(`/questionbank/${topicId}/${params}`);
  };

  if (isLoading) return <p className="p-10">Loading...</p>;
  if (isError) return <p className="p-10">Error: {(error as Error).message}</p>;

  return (
    <div className="min-h-screen bg-[#FDFCFE] p-4 md:p-10 font-sans text-[#1A1A1A]">
      <div>
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Question Bank</h1>

          <nav className="flex items-center gap-2 text-sm font-semibold flex-wrap">
            <span className="text-[#6B21A8]">Question Bank</span>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="text-[#6B21A8]">All MSK NEXUS Question Banks</span>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="text-[#6B21A8]">Knee</span>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="text-slate-900">Answers</span>
          </nav>
        </header>

        {/* Answer Box */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-bold mb-6">See All Answers</h2>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-13 gap-3 mb-12">
            {questions.map((q) => {
              const status = q.isCorrect === true ? "correct" : "incorrect";

              return (
                <button
                  key={q._id}
                  onClick={() => handelNavigate(q._id)}
                  className={`
                  h-8 w-full hover:bg-[#007760]/80 cursor-pointer max-w-[65px] flex items-center justify-center rounded-full text-white text-xs font-bold
                  ${status === "correct" ? "bg-[#007760]" : "bg-[#ED5555]"}
                `}
                >
                  {q.serialNumber.toString().padStart(2, "0")}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end">
            {/* <button className="bg-[#6B21A8] text-white px-6 py-2 rounded-lg font-bold text-sm">
              Clear All Answers
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllTopicQsAns;
