/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  Clock,
  Calendar,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pause,
  Play,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

// Result Popup Component
const ResultPopup = ({
  result,
  onClose,
}: {
  result: any;
  onClose: () => void;
}) => {
  const scorePercentage = result?.data?.scorePercentage || 0;

  // Determine color based on score
  const getScoreColor = () => {
    if (scorePercentage >= 80) return "text-green-600";
    if (scorePercentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Quiz Complete!
        </h2>

        {/* Score message */}
        <p className="text-center text-gray-600 mb-6">
          You have completed the quiz and you scored{" "}
          <span className={`font-bold text-2xl ${getScoreColor()}`}>
            {scorePercentage}%
          </span>{" "}
          of the questions you answered.
        </p>

        {/* Score details */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Questions:</span>
            <span className="font-semibold">
              {result?.data?.totalQuestions || 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Attempted:</span>
            <span className="font-semibold">
              {result?.data?.attemptedQuestions || 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Correct Answers:</span>
            <span className="font-semibold text-green-600">
              {result?.data?.correctAnswers || 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Incorrect Answers:</span>
            <span className="font-semibold text-red-600">
              {result?.data?.incorrectAnswers || 0}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-gray-600">Marks Obtained:</span>
            <span className="font-semibold text-lg">
              {result?.data?.obtainedMarks || 0} /{" "}
              {result?.data?.totalMarks || 0}
            </span>
          </div>
        </div>

        {/* Button */}
        <Button
          onClick={onClose}
          className="w-full bg-[#0e308d] hover:bg-[#0a246b] py-6 text-lg"
        >
          See Your Result
        </Button>
      </div>
    </div>
  );
};

const QuizDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.accessToken;

  // States
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string | null>
  >({});
  const [timeLeft, setTimeLeft] = useState(80 * 60); // 1h 20m in seconds
  const [isPaused, setIsPaused] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  // 1. Fetch Quiz Data
  const { data, isLoading } = useQuery({
    queryKey: ["quiz-questions", id],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/examattempt/${id}/questions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch questions");
      return res.json();
    },
    enabled: !!token && !!id,
  });

  const quizData = data?.data;
  const questions = quizData?.questions || [];
  const examInfo = quizData?.exam;

  // 2. Timer Logic
  useEffect(() => {
    if (timeLeft <= 0 || isPaused) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isPaused]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")} : ${String(m).padStart(2, "0")} : ${String(s).padStart(2, "0")}`;
  };

  // 3. Selection Logic
  const handleOptionSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  // 4. Submit Logic
  const isAllAnswered =
    questions.length > 0 &&
    questions.every((q: any) => selectedAnswers[q._id] !== undefined);

  const submitMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/examattempt/${id}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw new Error("Submission failed");
      return res.json();
    },
    onSuccess: (data) => {
      toast.success("Exam submitted successfully!");
      setSubmissionResult(data);
      setShowResult(true);
      // Don't redirect immediately, show popup instead
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleSubmit = () => {
    const timeSpent = 4800 - timeLeft; // Total 80m (4800s) - remaining
    const payload = {
      timeSpentSeconds: timeSpent,
      answers: questions.map((q: any) => ({
        questionId: q._id,
        selectedOptionId: selectedAnswers[q._id] || null,
      })),
    };
    submitMutation.mutate(payload);
  };

  const handleCloseResult = () => {
    setShowResult(false);
    // Optionally redirect to results page or dashboard
    router.push(`/custom-quizzes/${id}/result`); // or wherever you want to go after closing
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Result Popup */}
      {showResult && submissionResult && (
        <ResultPopup result={submissionResult} onClose={handleCloseResult} />
      )}

      <h1 className="text-3xl font-bold text-slate-900 mb-6">Custom Quizzes</h1>

      {/* Header Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-4">
          <div className="bg-slate-100 p-3 rounded-full">
            <Clock className="text-slate-600" />
          </div>
          <div>
            <p className="text-lg font-bold mb-2">Exam Time</p>
            <div className="flex items-center gap-3">
              <p
                className={`text-xl font-bold ${timeLeft < 300 ? "text-red-500" : "text-red-600"}`}
              >
                {formatTime(timeLeft)}
              </p>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                {isPaused ? (
                  <Play size={18} fill="currentColor" />
                ) : (
                  <Pause size={18} fill="currentColor" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-4">
          <div className="bg-slate-100 p-3 rounded-full">
            <Calendar className="text-slate-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Exam Name</p>
            <p className="text-xl font-bold text-slate-800">
              {examInfo?.examName || "12-08-2024"}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-4">
          <div className="bg-slate-100 p-3 rounded-full">
            <BookOpen className="text-slate-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Topic</p>
            <p className="text-xl font-bold text-slate-800 capitalize">
              {examInfo?.topicId || "Knee"}
            </p>
          </div>
        </div>
      </div>

      {/* Question Section */}
      <div className="bg-white rounded-2xl shadow-sm border p-8 mb-6 min-h-[400px]">
        {currentQuestion && (
          <>
            <h2 className="text-xl text-slate-800 leading-relaxed mb-8">
              {currentQuestion.serialNumber}. {currentQuestion.questionText}
            </h2>

            <div className="space-y-4">
              {currentQuestion.options.map((option: any) => (
                <label
                  key={option._id}
                  className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedAnswers[currentQuestion._id] === option._id
                      ? "border-slate-800 bg-slate-100"
                      : "border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <input
                    type="radio"
                    name={currentQuestion._id}
                    className="hidden"
                    onChange={() =>
                      handleOptionSelect(currentQuestion._id, option._id)
                    }
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                      selectedAnswers[currentQuestion._id] === option._id
                        ? "border-slate-800"
                        : "border-slate-300"
                    }`}
                  >
                    {selectedAnswers[currentQuestion._id] === option._id && (
                      <div className="w-2.5 h-2.5 bg-slate-800 rounded-full" />
                    )}
                  </div>
                  <span className="text-slate-700 font-medium">
                    {option.text}
                  </span>
                </label>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom Actions & Pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <Button
          disabled={!isAllAnswered || submitMutation.isPending}
          onClick={handleSubmit}
          className="bg-[#0e308d] hover:bg-[#0a246b] px-10 py-6 text-lg min-w-[150px]"
        >
          {submitMutation.isPending ? (
            <Loader2 className="animate-spin mr-2" />
          ) : (
            "Submit"
          )}
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
            }
            disabled={currentQuestionIndex === 0}
            className="rounded-full border-slate-200"
          >
            <ChevronLeft size={20} />
          </Button>

          <div className="flex gap-2 mx-2">
            {questions.map((_: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-10 h-10 rounded-full font-semibold transition-all ${
                  currentQuestionIndex === idx
                    ? "bg-[#0e308d] text-white"
                    : selectedAnswers[questions[idx]._id]
                      ? "bg-slate-200 text-slate-700"
                      : "bg-white text-slate-400 border border-slate-200"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCurrentQuestionIndex((prev) =>
                Math.min(questions.length - 1, prev + 1),
              )
            }
            disabled={currentQuestionIndex === questions.length - 1}
            className="rounded-full border-slate-200"
          >
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizDetails;
