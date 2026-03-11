"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";

interface Option {
  optionId: string;
  text: string;
  isCorrect: boolean;
  selectedCount: number;
}

interface ResultData {
  questionId: string;
  questionText: string;
  explanation: string;
  isCorrect: boolean;
  selectedOptionId: string;
  options: Option[];
}

interface ApiResponse {
  message: string;
  statusCode: number;
  status: string;
  data: ResultData;
}

const StudyExamQuizDetails = () => {
  const { id, resultId } = useParams();
  const session = useSession();
  const token = session?.data?.accessToken;

  const { data, isLoading } = useQuery<ApiResponse>({
    queryKey: ["study-exam-result-details", resultId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/quiz/${id}/question/${resultId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch question details");
      return res.json();
    },
    enabled: !!token,
  });

  if (isLoading)
    return <div className="p-6 animate-pulse bg-slate-100 h-96 rounded-xl" />;
  if (!data?.data) return null;

  const { questionText, explanation, selectedOptionId, options } = data.data;

  // Calculate total selected count for percentage calculation
  const totalSelectedCount = options.reduce(
    (sum, option) => sum + option.selectedCount,
    0,
  );

  // Calculate percentage for each option
  const optionsWithPercentage = options.map((option) => ({
    ...option,
    selectedPercentage:
      totalSelectedCount > 0
        ? Math.round((option.selectedCount / totalSelectedCount) * 100)
        : 0,
  }));

  return (
    <div className="p-6 bg-white font-sans text-slate-900">
      {/* Question Title */}
      <h2 className="text-xl font-semibold mb-8 leading-relaxed">
        {questionText}
      </h2>

      {/* Options List */}
      <div className="space-y-3 mb-10">
        {optionsWithPercentage.map((option) => {
          const isUserSelected = option.optionId === selectedOptionId;
          const isCorrect = option.isCorrect;

          // Determine colors based on status
          let bgColor = "bg-white";
          let borderColor = "border-slate-200";
          let dotColor = "border-slate-400";
          let textColor = "text-slate-700";

          if (isCorrect) {
            bgColor = "bg-emerald-100";
            borderColor = "border-emerald-500";
            dotColor = "bg-emerald-600 border-emerald-600";
            textColor = "text-emerald-900";
          } else if (isUserSelected && !isCorrect) {
            bgColor = "bg-red-600";
            borderColor = "border-red-600";
            dotColor = "bg-white border-white";
            textColor = "text-white";
          }

          return (
            <div key={option.optionId} className="flex items-center gap-2">
              {/* Percentage Bar */}
              <div className="w-52 flex items-center justify-end gap-2">
                <span className="text-sm font-medium text-slate-500">
                  {option.selectedPercentage}%
                </span>
                <div className="flex-1 h-6 bg-slate-100 rounded-sm overflow-hidden flex justify-end">
                  <div
                    className={`h-full ${isCorrect ? "bg-emerald-600" : isUserSelected ? "bg-red-600" : "bg-slate-300"}`}
                    style={{ width: `${option.selectedPercentage}%` }}
                  />
                </div>
              </div>

              {/* Option Card */}
              <div
                className={`flex-1 flex items-center gap-3 p-3 rounded-md border ${bgColor} ${borderColor} transition-all`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${dotColor}`}
                >
                  {(isCorrect || isUserSelected) && (
                    <div className="w-2 h-2 rounded-full bg-current" />
                  )}
                </div>
                <span className={`text-sm font-medium ${textColor}`}>
                  {option.text}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Explanation Section */}
      <div className="mt-8">
        <h1 className="text-lg font-semibold mb-3">Explanation :</h1>
        <div
          className="prose prose-sm max-w-none text-slate-700 leading-relaxed explanation-content"
          dangerouslySetInnerHTML={{ __html: explanation }}
        />
      </div>
    </div>
  );
};

export default StudyExamQuizDetails;
