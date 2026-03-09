"use client";
import React from "react";
import { Shuffle, FileText, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { InjuryResponse } from "@/types/allquestionDataType";
import Image from "next/image";
import { useRouter } from "next/navigation";

const QuestionBank = () => {
  const router = useRouter();

  const { data, isLoading, error, isError } = useQuery<InjuryResponse>({
    queryKey: ["injuries"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/injury/get-all`,
      );

      if (!res.ok) throw new Error("Failed to fetch injuries");

      return res.json();
    },
  });

  const injuries = data?.data || [];

  const handelNavigate = (params: string) => {
    router.push(`/questionbank/${params}`);
  };

  if (isLoading) return <p className="p-10">Loading...</p>;
  if (isError) return <p className="p-10">Error: {(error as Error).message}</p>;

  return (
    <div className="min-h-screen bg-[#FDFCFE] p-4 md:p-10 text-[#1A1A1A] font-sans">
      <div>
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Question Bank
          </h1>

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

        {/* Injury List */}
        <div className="space-y-3">
          {injuries.map((item) => (
            <div
              onClick={() => handelNavigate(item.Primary_Body_Region)}
              key={item._id}
              className="flex cursor-pointer flex-col lg:flex-row items-start lg:items-center justify-between p-5 rounded-xl border border-slate-100 shadow-sm bg-white hover:shadow-md transition"
            >
              {/* Left */}
              <div className="flex items-center gap-4 w-full lg:w-1/3">
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                  {item.Image_URL ? (
                    <Image
                      width={40}
                      height={40}
                      src={item.Image_URL}
                      alt={item.Name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-400 to-slate-200" />
                  )}
                </div>

                <h3 className="font-semibold text-[15px] text-slate-800">
                  {item.Name}
                </h3>
              </div>

              {/* Right */}
              <div className="flex flex-col sm:flex-row flex-1 items-start sm:items-center gap-4 lg:gap-8 w-full mt-4 lg:mt-0">
                <div className="flex items-center gap-2 text-[#6B21A8] font-bold text-sm">
                  <FileText size={18} />
                  <span>MCQs</span>
                </div>

                {/* Progress bar (dummy for now) */}
                <div className="flex-1 h-[6px] w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#6B21A8] w-[70%]" />
                </div>

                <div className="text-sm font-semibold text-slate-700">
                  {item.Importance_Level}
                </div>

                <div className="text-sm text-slate-400">
                  {item.Primary_Body_Region}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionBank;
