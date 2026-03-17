import React from "react";
import {
  X,
  CheckCircle,
  XCircle,
  Percent,
  Target,
  BookOpen,
} from "lucide-react";

interface MCQStatsData {
  correctCount: number;
  incorrectCount: number;
  correctPercentage: number;
  incorrectPercentage: number;
  totalAttempts?: number;
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
  questions?: MCQQuestion[];
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

  const typedQuestions = questions;

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
          <div className="mb-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 shadow-inner">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Your Progress
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-[#0077A3]">
                    {attemptedCount}
                  </span>
                  <span className="text-lg font-medium text-slate-400">
                    / {totalQuestions}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-[#0077A3]">
                  {totalQuestions > 0
                    ? Math.round((attemptedCount / totalQuestions) * 100)
                    : 0}
                  %
                </span>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Completion
                </p>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0077A3] rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${totalQuestions > 0 ? (attemptedCount / totalQuestions) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {stats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 mb-2">
                <p className="text-xs font-bold text-slate-400 uppercase text-center">
                  Total Individual Attempts:{" "}
                  {stats.totalAttempts ||
                    stats.correctCount + stats.incorrectCount}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Correct Count */}
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/30 flex flex-col items-center justify-center shadow-sm">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mb-1" />
                  <p className="text-xs font-bold text-emerald-700/70 dark:text-emerald-400/70 uppercase">
                    Total Correct
                  </p>
                  <p className="text-3xl font-black text-emerald-600 dark:text-emerald-300">
                    {stats.correctCount}
                  </p>
                </div>

                {/* Incorrect Count */}
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-100 dark:border-red-800/30 flex flex-col items-center justify-center shadow-sm">
                  <XCircle className="w-8 h-8 text-red-500 mb-1" />
                  <p className="text-xs font-bold text-red-700/70 dark:text-red-400/70 uppercase">
                    Total Incorrect
                  </p>
                  <p className="text-3xl font-black text-red-600 dark:text-red-300">
                    {stats.incorrectCount}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Accuracy Card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex justify-between items-center shadow-sm">
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                      Accuracy
                    </p>
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-200">
                      {stats.correctPercentage}%
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Percent className="w-5 h-5" />
                  </div>
                </div>

                {/* Unanswered Card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex justify-between items-center shadow-sm">
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                      Unattempted
                    </p>
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-200">
                      {totalQuestions - attemptedCount}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-slate-500 italic py-4">
              No stats available yet. Start answering to track progress.
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
                    <div
                      className="font-medium text-slate-800 dark:text-slate-200 leading-snug prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: q.questionText }}
                    />
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
                      <div
                        className="text-sm text-blue-900 dark:text-blue-300 prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: q.explanation }}
                      />
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
