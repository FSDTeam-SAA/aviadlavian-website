/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  BookOpen,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Result Popup Component
const ResultPopup = ({
  result,
  onClose,
}: {
  result: any;
  onClose: () => void;
}) => {
  const scorePercentage = result?.data?.scorePercentage || 0;

  const getScoreColor = () => {
    if (scorePercentage >= 80) return "text-green-600";
    if (scorePercentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-4">
      <div className="bg-white rounded-4xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Quiz Complete!
        </h2>

        <p className="text-center text-gray-600 mb-8 px-2">
          You have completed the quiz and you scored{" "}
          <span className={`font-extrabold text-2xl ${getScoreColor()}`}>
            {scorePercentage}%
          </span>{" "}
          of the questions.
        </p>

        <div className="bg-gray-50 rounded-2xl p-6 mb-8 space-y-4 border border-gray-100">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Total Questions</span>
            <span className="font-bold text-gray-800">
              {result?.data?.totalQuestions || 0}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Attempted</span>
            <span className="font-bold text-gray-800">
              {result?.data?.attemptedQuestions || 0}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium italic text-green-600">
              Correct Answers
            </span>
            <span className="font-bold text-green-600">
              {result?.data?.correctAnswers || 0}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium italic text-red-500">
              Incorrect Answers
            </span>
            <span className="font-bold text-red-500">
              {result?.data?.incorrectAnswers || 0}
            </span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
            <span className="text-gray-700 font-bold text-base">
              Marks Obtained
            </span>
            <span className="font-black text-xl text-purple-900">
              {result?.data?.obtainedMarks || 0} /{" "}
              {result?.data?.totalMarks || 0}
            </span>
          </div>
        </div>

        <Button
          onClick={onClose}
          className="w-full bg-purple-900 hover:bg-purple-800 py-7 rounded-2xl text-lg font-bold transition-all shadow-lg shadow-purple-100"
        >
          See Your Result
        </Button>
      </div>
    </div>
  );
};

const StudyExamModes = () => {
  const params = useParams();
  const router = useRouter();
  const quizId = params?.id;

  const { data: session } = useSession();
  const token = session?.accessToken;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [studyFeedback, setStudyFeedback] = useState<any>(null);

  // 1. Fetch Quiz Data
  const { data: quizResponse, isLoading } = useQuery({
    queryKey: ["quiz-questions", quizId],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/quiz/${quizId}/questions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    },
    enabled: !!quizId && !!token,
  });

  // 2. Study Mode Mutation
  const answerMutation = useMutation({
    mutationFn: async (answerData: any) => {
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
      toast.success(response.message || "Answer recorded!", {
        id: "quiz-toast",
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error recording answer", {
        id: "quiz-toast",
      });
    },
  });

  // 3. Exam Mode Submit Mutation
  const submitMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post(
        `${API_URL}/quiz/${quizId}/submit`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Exam submitted successfully!", { id: "submit-toast" });
      setSubmissionResult(data);
      setShowResult(true); // রেজাল্ট পপ-আপ দেখাবে
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Submission failed");
    },
  });

  const questions = quizResponse?.questions || [];
  const quizInfo = quizResponse?.quiz || {};
  const currentQuestion = questions[currentIndex];
  const isStudyMode = quizInfo?.mode === "study";

  const handleOptionSelect = (optionId: string) => {
    if (isStudyMode) {
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
      timeSpentSeconds: 600, // আপনি চাইলে এখানে রিয়েল টাইম ক্যালকুলেশন দিতে পারেন
      answers: questions.map((q: any) => ({
        questionId: q._id,
        selectedOptionId: examAnswers[q._id] || null,
      })),
    };
    submitMutation.mutate(payload);
  };

  const handleCloseResult = () => {
    setShowResult(false);
    router.push(`/custom-quizzes/study-exam-mode/${quizId}/history`); // রেজাল্ট পেজে রিডাইরেক্ট
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-purple-600" size={40} />
      </div>
    );

  return (
    <div className="p-4 md:p-8 bg-[#F9FAFB] min-h-screen">
      {/* Result Popup Overlay */}
      {showResult && submissionResult && (
        <ResultPopup result={submissionResult} onClose={handleCloseResult} />
      )}

      {/* 1. Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <Calendar className="text-gray-500" />
          <div>
            <span className="text-xs text-gray-400 block font-bold uppercase tracking-widest">
              Exam Name
            </span>
            <span className="font-bold text-gray-700">
              {new Date(quizInfo?.startedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <BookOpen className="text-gray-500" />
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
        {answerMutation.isPending && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
            <Loader2 className="animate-spin text-purple-600" size={40} />
          </div>
        )}

        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-10">
          {currentIndex + 1}. {currentQuestion?.questionText}
        </h2>

        <div className="space-y-4">
          {currentQuestion?.options.map((option: any) => {
            const isSelected = examAnswers[currentQuestion._id] === option._id;

            let btnStyle =
              "border-gray-100 bg-white text-gray-700 hover:border-purple-200 hover:bg-gray-50";
            if (isStudyMode && studyFeedback) {
              const stat = studyFeedback.optionStats.find(
                (s: any) => s.optionId === option._id,
              );
              if (stat?.isCorrect)
                btnStyle = "bg-green-50 border-green-500 text-green-700";
              else if (
                studyFeedback.optionStats.find(
                  (s: any) => s.optionId === option._id && s.selectedCount > 0,
                )
              )
                btnStyle = "bg-red-50 border-red-500 text-red-700";
            } else if (!isStudyMode && isSelected) {
              btnStyle =
                "bg-purple-900 border-purple-900 text-white shadow-lg scale-[1.01]";
            }

            return (
              <button
                key={option._id}
                disabled={isStudyMode && !!studyFeedback}
                onClick={() => handleOptionSelect(option._id)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 font-medium ${btnStyle}`}
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-white" : "border-gray-300"}`}
                >
                  {(isSelected ||
                    (isStudyMode &&
                      studyFeedback?.optionStats?.find(
                        (s: any) =>
                          s.optionId === option._id && s.selectedCount > 0,
                      ))) && (
                    <div
                      className={`w-3 h-3 rounded-full ${isSelected ? "bg-white" : "bg-purple-600"}`}
                    />
                  )}
                </div>
                <span>{option.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Study Explanation */}
      {isStudyMode && studyFeedback && (
        <div className="bg-white p-6 md:p-8 rounded-4xl border border-gray-100 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-5">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Explanation :
          </h3>
          <p className="text-gray-600 leading-loose italic">
            {studyFeedback.explanation}
          </p>
        </div>
      )}

      {/* 4. Navigation */}
      <div className="flex items-center justify-between bg-white p-4 rounded-full shadow-md border mt-10 sticky bottom-4">
        <button
          disabled={currentIndex === 0}
          onClick={() => {
            setCurrentIndex((prev) => prev - 1);
            setStudyFeedback(null);
          }}
          className="p-3 disabled:opacity-20"
        >
          <ChevronLeft />
        </button>
        <div className="hidden md:flex gap-2">
          {questions.map((_: any, idx: number) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setStudyFeedback(null);
              }}
              className={`w-10 h-10 rounded-full font-bold transition-all ${currentIndex === idx ? "bg-purple-900 text-white scale-110 shadow-lg" : "text-gray-400"}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
        {currentIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmitQuiz}
            disabled={submitMutation.isPending}
            className="bg-green-600 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2"
          >
            {submitMutation.isPending && (
              <Loader2 className="animate-spin" size={20} />
            )}
            Finish Quiz
          </button>
        ) : (
          <button
            onClick={() => {
              setCurrentIndex((prev) => prev + 1);
              setStudyFeedback(null);
            }}
            className="p-3"
          >
            <ChevronRight />
          </button>
        )}
      </div>
    </div>
  );
};

export default StudyExamModes;
