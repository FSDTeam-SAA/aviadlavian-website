/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  BookOpen,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const StudyExamModes = () => {
  const params = useParams();
  const router = useRouter();
  const quizId = params?.id;

  const { data: session } = useSession();
  const token = session?.accessToken;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({}); // Exam Mode answers
  const [studyFeedback, setStudyFeedback] = useState<{
    isCorrect: boolean;
    explanation: string;
    optionStats: Array<{
      optionId: string;
      isCorrect: boolean;
      selectedCount: number;
    }>;
  } | null>(null); // Study Mode real-time feedback

  // --- API CALLS ---

  // ১. Fetch Quiz & Questions
  const {
    data: quizResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["quiz-questions", quizId],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/quiz/${quizId}/questions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    },
    enabled: !!quizId && !!token,
  });

  // ២. Study Mode Answer Mutation
  const answerMutation = useMutation({
    mutationFn: async (answerData: {
      questionId: string;
      selectedOptionId: string;
    }) => {
      const res = await axios.post(
        `${API_URL}/quiz/${quizId}/answer`,
        answerData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return res.data;
    },
    onSuccess: (response) => {
      setStudyFeedback(response.data);
      if (response.data.isCorrect) {
        toast.success(response.message || "Correct Answer!", {
          id: "quiz-toast", // unique ID avoids duplicates
          icon: <CheckCircle2 className="text-green-500" size={18} />,
        });
      } else {
        toast.error("Incorrect Answer", {
          id: "quiz-toast",
          icon: <XCircle className="text-red-500" size={18} />,
        });
      }
    },
    onError: (error) => {
      const msg =
        (error as AxiosError<any>).response?.data?.message ||
        "Something went wrong";
      toast.error(msg, { id: "quiz-toast" });
    },
  });

  // ৩. Exam Mode Submit Mutation
  const submitMutation = useMutation({
    mutationFn: async (payload: {
      timeSpentSeconds: number;
      answers: Array<{ questionId: string; selectedOptionId: string | null }>;
    }) => {
      const res = await axios.post(
        `${API_URL}/quiz/${quizId}/submit`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Quiz submitted successfully!", { id: "submit-toast" });
      router.push("/results");
    },
    onError: (error) => {
      const msg =
        (error as AxiosError<any>).response?.data?.message ||
        "Submission failed";
      toast.error(msg, { id: "submit-toast" });
    },
  });

  // --- HANDLERS ---
  const questions = quizResponse?.questions || [];
  const quizInfo = quizResponse?.quiz || {};
  const currentQuestion = questions[currentIndex];
  const isStudyMode = quizInfo?.mode === "study";

  const handleOptionSelect = (optionId: any) => {
    if (isStudyMode) {
      // যদি আগে থেকেই উত্তর দেওয়া থাকে বা লোডিং থাকে তবে ক্লিক বন্ধ
      if (studyFeedback || answerMutation.isPending) return;

      answerMutation.mutate({
        questionId: currentQuestion._id,
        selectedOptionId: optionId,
      });
    } else {
      setExamAnswers((prev) => ({ ...prev, [currentQuestion._id]: optionId }));
    }
  };

  const handleSubmitQuiz = () => {
    const payload = {
      timeSpentSeconds: 600,
      answers: questions.map((q: any) => ({
        questionId: q._id,
        selectedOptionId: examAnswers[q._id] || null,
      })),
    };
    submitMutation.mutate(payload);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setStudyFeedback(null); // Reset feedback for next question
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setStudyFeedback(null);
    }
  };

  // --- RENDER LOGIC ---
  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-purple-600 mb-4" size={48} />
        <p className="text-gray-500 font-medium animate-pulse">
          Fetching Questions...
        </p>
      </div>
    );

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-500">
        <AlertCircle size={48} className="mb-4" />
        <p className="text-lg font-bold">Failed to load quiz data</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-purple-600 underline"
        >
          Try Again
        </button>
      </div>
    );

  return (
    <div className="p-4 md:p-8 bg-[#F9FAFB] min-h-screen">
      {/* 1. Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-gray-50 p-3 rounded-xl">
            <Calendar className="text-gray-500" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-bold uppercase tracking-widest">
              Exam Name
            </span>
            <span className="font-bold text-gray-700">
              {new Date(quizInfo?.startedAt).toLocaleDateString() || "N/A"}
            </span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-gray-50 p-3 rounded-xl">
            <BookOpen className="text-gray-500" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-bold uppercase tracking-widest">
              Topic
            </span>
            <span className="font-bold text-gray-700 capitalize">
              {quizInfo?.quizName?.split(" ")[0]}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Question Card */}
      <div className="bg-white p-6 md:p-10 rounded-4xl shadow-sm border border-gray-50 mb-6 relative overflow-hidden">
        {/* Loader Overlay for Study Mode Mutation */}
        {answerMutation.isPending && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
            <Loader2 className="animate-spin text-purple-600" size={40} />
          </div>
        )}

        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-10 leading-relaxed">
          {currentIndex + 1}. {currentQuestion?.questionText}
        </h2>

        <div className="space-y-4">
          {currentQuestion?.options.map((option: any) => {
            const isSelectedInExam =
              examAnswers[currentQuestion._id] === option._id;

            let btnStyle =
              "border-gray-100 bg-white text-gray-700 hover:border-purple-200 hover:bg-gray-50";

            if (isStudyMode && studyFeedback) {
              const stat = studyFeedback.optionStats.find(
                (s) => s.optionId === option._id,
              );
              if (stat?.isCorrect) {
                btnStyle =
                  "bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500";
              } else if (
                studyFeedback.optionStats.find(
                  (s) => s.optionId === option._id && s.selectedCount > 0,
                )
              ) {
                btnStyle =
                  "bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500";
              }
            } else if (!isStudyMode && isSelectedInExam) {
              btnStyle =
                "bg-purple-900 border-purple-900 text-white shadow-lg scale-[1.01]";
            }

            return (
              <button
                key={option._id}
                disabled={
                  isStudyMode && (!!studyFeedback || answerMutation.isPending)
                }
                onClick={() => handleOptionSelect(option._id)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 font-medium group ${btnStyle}`}
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelectedInExam ? "border-white" : "border-gray-300 group-hover:border-purple-400"}`}
                >
                  {(isSelectedInExam ||
                    (isStudyMode &&
                      studyFeedback?.optionStats?.find(
                        (s) => s.optionId === option._id && s.selectedCount > 0,
                      ))) && (
                    <div
                      className={`w-3 h-3 rounded-full ${isSelectedInExam ? "bg-white" : "bg-purple-600"}`}
                    />
                  )}
                </div>
                <span className="text-base md:text-lg">{option.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Study Mode Explanation Section */}
      {isStudyMode && studyFeedback && (
        <div className="bg-white p-6 md:p-8 rounded-4xl border border-gray-100 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            Explanation :
          </h3>
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1">
              <p className="text-gray-600 leading-loose mb-8 text-lg italic font-light">
                {studyFeedback.explanation}
              </p>
              <button className="bg-purple-900 text-white px-10 py-4 rounded-2xl font-bold text-sm hover:bg-purple-800 transition-all active:scale-95 shadow-md shadow-purple-200">
                Add to Learning Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Pagination & Control Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-full shadow-md border border-gray-100 mt-12 sticky bottom-4 z-30">
        <button
          disabled={currentIndex === 0}
          onClick={handlePrev}
          className="p-3 hover:bg-gray-100 rounded-full disabled:opacity-20 transition-all active:bg-gray-200"
        >
          <ChevronLeft size={28} className="text-gray-700" />
        </button>

        <div className="hidden md:flex gap-3">
          {questions.map((_: any, idx: any) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setStudyFeedback(null);
              }}
              className={`w-10 h-10 rounded-full text-sm font-bold transition-all transform ${
                currentIndex === idx
                  ? "bg-purple-900 text-white scale-110 shadow-lg"
                  : "text-gray-400 hover:text-purple-600 hover:bg-purple-50"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {/* Mobile progress indicator */}
        <span className="md:hidden font-bold text-purple-900">
          {currentIndex + 1} / {questions.length}
        </span>

        {currentIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmitQuiz}
            disabled={submitMutation.isPending}
            className="bg-green-600 text-white px-10 py-3 rounded-full font-bold hover:bg-green-700 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-green-100"
          >
            {submitMutation.isPending && (
              <Loader2 className="animate-spin" size={20} />
            )}
            Finish Quiz
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="p-3 hover:bg-gray-100 rounded-full transition-all active:bg-gray-200"
          >
            <ChevronRight size={28} className="text-gray-700" />
          </button>
        )}
      </div>
    </div>
  );
};

export default StudyExamModes;
