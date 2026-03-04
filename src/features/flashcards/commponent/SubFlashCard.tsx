"use client";

import React from "react";
import Link from "next/link";

type QuestionItem = {
  id: string;
  question: string;
  status: "Correct" | "Incorrect";
};

type SubFlashCardProps = {
  flashcardTitle?: string;
  subspecialtyTitle?: string;
  chapterTitle?: string;
};

const demoQuestions: QuestionItem[] = [
  {
    id: "1",
    question:
      "A 65 years old male presents with sudden onset chest pain radiating to his back. What is most likely diagnosis?",
    status: "Correct",
  },
  {
    id: "2",
    question:
      "A 65 years old male presents with sudden onset chest pain radiating to his back. What is most likely diagnosis?",
    status: "Incorrect",
  },
  {
    id: "3",
    question:
      "A 65 years old male presents with sudden onset chest pain radiating to his back. What is most likely diagnosis?",
    status: "Correct",
  },
  {
    id: "4",
    question:
      "A 65 years old male presents with sudden onset chest pain radiating to his back. What is most likely diagnosis?",
    status: "Correct",
  },
  {
    id: "5",
    question:
      "A 65 years old male presents with sudden onset chest pain radiating to his back. What is most likely diagnosis?",
    status: "Correct",
  },
  {
    id: "6",
    question:
      "A 65 years old male presents with sudden onset chest pain radiating to his back. What is most likely diagnosis?",
    status: "Correct",
  },
  {
    id: "7",
    question:
      "A 65 years old male presents with sudden onset chest pain radiating to his back. What is most likely diagnosis?",
    status: "Correct",
  },
  {
    id: "8",
    question:
      "A 65 years old male presents with sudden onset chest pain radiating to his back. What is most likely diagnosis?",
    status: "Correct",
  },
  {
    id: "9",
    question:
      "A 65 years old male presents with sudden onset chest pain radiating to his back. What is most likely diagnosis?",
    status: "Correct",
  },
  {
    id: "10",
    question:
      "A 65 years old male presents with sudden onset chest pain radiating to his back. What is most likely diagnosis?",
    status: "Incorrect",
  },
];

const SubFlashCard = ({
  flashcardTitle = "Flashcard",
  subspecialtyTitle = "Knee",
  chapterTitle = "Chondromalacia Patella",
}: SubFlashCardProps) => {
  const completedQuestions = 177;
  const completedPercent = 81;

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Flashcards
        </h1>

        <div className="mt-2 text-sm text-orange-700 dark:text-orange-400">
          <span>{flashcardTitle}</span>
          <span className="mx-1">&gt;</span>
          <span>{subspecialtyTitle}</span>
          <span className="mx-1">&gt;</span>
          <span>{chapterTitle}</span>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5 dark:border-slate-700 dark:bg-slate-800/60">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {chapterTitle} Flashcards
          </h2>

          <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
            Your Progress
          </p>

          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${completedPercent}%` }}
            />
          </div>

          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
            <span className="font-semibold text-orange-700 dark:text-orange-400">
              {completedPercent}% completed
            </span>{" "}
            of {completedQuestions} questions completed
          </p>

          <button
            type="button"
            className="mt-4 rounded-full bg-orange-700 px-6 py-2 text-sm font-semibold text-white transition hover:bg-orange-800"
          >
            Resume Flashback
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
            Choose a subspecialty to study
          </h2>

          <ul className="mt-4 space-y-3">
            {demoQuestions.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-800 dark:text-slate-200">
                      <span className="font-medium">Q :</span> {item.question}
                    </p>
                    <Link
                      href={{
                        pathname: `/flashcards/subspecialty/${item.id}`,
                        query: {
                          question: item.question,
                          subspecialty: subspecialtyTitle,
                          chapter: chapterTitle,
                        },
                      }}
                      className="mt-1 inline-block text-sm font-semibold text-orange-700 transition hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
                    >
                      Reveal answer
                    </Link>
                  </div>

                  <span
                    className={`shrink-0 text-sm font-medium ${
                      item.status === "Correct"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SubFlashCard;
