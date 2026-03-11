import React from "react";
import { X, CheckCircle, XCircle, Percent, Target } from "lucide-react";

interface MCQStatsData {
  correctCount: number;
  incorrectCount: number;
  correctPercentage: number;
  incorrectPercentage: number;
}

export interface MCQOption {
  optionId: string;
  text: string;
  selectedCount: number;
  isCorrect: boolean;
}

export interface MCQQuestion {
  serialNumber: number;
  _id: string;
  questionText: string;
  explanation: string;
  isAttempted: boolean;
  options: MCQOption[];
}

interface MCQStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats?: MCQStatsData;
  totalQuestions?: number;
  attemptedCount?: number;
  questions?: unknown[]; // using unknown[] to match the parent component, but internally we'll cast to MCQQuestion[]
}

const MCQStatsModal: React.FC<MCQStatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  totalQuestions = 0,
  attemptedCount = 0,
  questions = [],
}) => {
  if (!isOpen) return null;

  const typedQuestions = questions as MCQQuestion[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-[#0077A3]" /> Performance Stats
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Overall Progress */}
          <div className="mb-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Completed
              </p>
              <p className="text-3xl font-bold text-[#0077A3]">
                {attemptedCount}{" "}
                <span className="text-lg text-slate-400">
                  / {totalQuestions}
                </span>
              </p>
            </div>
          </div>

          {stats ? (
            <div className="grid grid-cols-2 gap-4">
              {/* Correct Count */}
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/30 flex flex-col items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  Correct
                </p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">
                  {stats.correctCount}
                </p>
              </div>

              {/* Incorrect Count */}
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-100 dark:border-red-800/30 flex flex-col items-center justify-center">
                <XCircle className="w-8 h-8 text-red-500 mb-2" />
                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                  Incorrect
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-300">
                  {stats.incorrectCount}
                </p>
              </div>

              {/* Correct Percentage */}
              <div className="col-span-1 bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 mt-2 flex justify-between items-center shadow-sm">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Accuracy
                  </p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    {stats.correctPercentage}%
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Percent className="w-5 h-5" />
                </div>
              </div>

              {/* Incorrect Percentage */}
              <div className="col-span-1 bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 mt-2 flex justify-between items-center shadow-sm">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Error Rate
                  </p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    {stats.incorrectPercentage}%
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                  <Percent className="w-5 h-5" />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-slate-500">
              No stats available yet.
            </p>
          )}
        </div>

        {/* Questions List */}
        {typedQuestions && typedQuestions.length > 0 && (
          <div className="px-6 pb-6 max-h-[40vh] overflow-y-auto border-t border-slate-100 dark:border-slate-800 pt-4 custom-scrollbar">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 sticky top-0 bg-white dark:bg-slate-900 py-1 z-10">
              Questions Review
            </h3>
            <div className="space-y-6">
              {typedQuestions.map((q) => (
                <div
                  key={q._id}
                  className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex gap-3 mb-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0077A3] text-white flex items-center justify-center text-xs font-bold mt-0.5">
                      {q.serialNumber}
                    </div>
                    <p className="font-medium text-slate-800 dark:text-slate-200 leading-snug">
                      {q.questionText}
                    </p>
                  </div>

                  <div className="space-y-2 ml-9 mb-4">
                    {q.options.map((opt) => (
                      <div
                        key={opt.optionId}
                        className={`p-3 rounded-lg border text-sm flex items-center justify-between ${
                          opt.isCorrect
                            ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 font-medium"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {opt.isCorrect && (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          )}
                          {opt.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {q.explanation && (
                    <div className="ml-9 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30">
                      <p className="text-xs font-semibold text-blue-800 dark:text-blue-400 mb-1 uppercase tracking-wider">
                        Explanation
                      </p>
                      <p className="text-sm text-blue-900 dark:text-blue-300">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MCQStatsModal;
