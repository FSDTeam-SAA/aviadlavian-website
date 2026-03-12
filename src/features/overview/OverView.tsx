"use client";
import React from "react";
import Link from "next/link";
import {
  BookText,
  FileText,
  Grid2x2,
  NotebookPen,
  Settings,
  Zap,
  Clock3,
  CircleDashed,
  Coffee,
  PencilLine,
  Highlighter,
} from "lucide-react";

import { useOverviewProgress } from "./hooks/useOverview";

const topCards = [
  {
    title: "Text",
    subtitle: "Cardiovascular Medicine > Epidemiology and Risk Factors",
    icon: NotebookPen,
    href: "/library",
  },
  {
    title: "Question Bank",
    subtitle: "MSKAP Questions > Endocrinology & Metabolism > Question 5",
    icon: Grid2x2,
    href: "/questionbank",
  },
  {
    title: "Learning Plan",
    subtitle: "Pulmonary & Critical Care Medicine > Pulmonary Diagnostic Tests",
    icon: FileText,
    href: "/learningplan",
  },
  {
    title: "Flashcard",
    subtitle: "Cardiovascular Medicine",
    icon: Zap,
    href: "/flashcards",
  },
  {
    title: "Custom Quizzes",
    subtitle: "Custom Quizzes > 8/5/2026",
    icon: PencilLine,
    href: "/custom-quizzes",
  },
  {
    title: "Settings",
    subtitle: "Make the Setup",
    icon: Settings,
    href: "/settings",
  },
];

const OverView = () => {
  const { data: progressRes, isLoading } = useOverviewProgress();
  const progressData = progressRes?.data;

  const progressCards = [
    {
      label: "Total Quizzes",
      value: progressData?.totalQuiz?.toString() || "0",
      icon: Clock3,
      color: "text-orange-500",
      bg: "bg-orange-50",
      border: "border-orange-200",
    },
    {
      label: "Total Questions",
      value: progressData?.totalQuestions?.toString() || "0",
      icon: CircleDashed,
      color: "text-blue-500",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      label: "Flashcards",
      value: progressData?.totalFlashcards?.toString() || "0",
      icon: Coffee,
      color: "text-violet-500",
      bg: "bg-violet-50",
      border: "border-violet-200",
    },
  ];
  return (
    <section className="w-full transition-colors dark:text-slate-100">
      <div className="mx-auto space-y-6">
        <div>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Home
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {topCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link key={card.title} href={card.href}>
                <article className="group h-full rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-900 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-900 hover:bg-[#0f3b97] hover:text-white hover:shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                  <Icon
                    size={38}
                    className="mx-auto text-[#0f3b97] transition-colors duration-300 group-hover:text-white"
                  />
                  <h3 className="mt-4 text-4xl font-semibold">{card.title}</h3>
                  <p className="mt-3 text-sm text-slate-600 transition-colors duration-300 dark:text-slate-400 group-hover:text-blue-100">
                    {card.subtitle}
                  </p>
                </article>
              </Link>
            );
          })}
        </div>

        <div>
          <h3 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
            See Your Progress
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {progressCards.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.label}
                  className={`rounded-2xl border px-5 py-4 ${item.bg} ${item.border} dark:border-slate-700 dark:bg-slate-900 shadow-sm`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-full border-2 border-current/30 ${item.color}`}
                    >
                      <Icon size={28} />
                    </div>

                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {item.label}
                      </p>
                      <p className="text-4xl font-semibold text-slate-900 dark:text-slate-100">
                        {item.value}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
            Notes &amp; Highlights
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Link href="/library">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900 cursor-pointer h-full">
                <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
                  <BookText size={24} />
                  <h4 className="text-3xl font-semibold">Notes</h4>
                </div>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                  Your notes, organized by content type and subspecialty
                </p>
                <div className="mt-4 rounded-lg bg-[#0f3b97] px-4 py-1 text-center text-lg font-semibold text-white">
                  {progressData?.totalNotes || 0} Notes
                </div>
              </article>
            </Link>

            <Link href="/library">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900 cursor-pointer h-full">
                <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
                  <Highlighter size={24} />
                  <h4 className="text-3xl font-semibold">Highlights</h4>
                </div>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                  Content you&apos;ve highlighted, organized by type and
                  subspecialty
                </p>
                <div className="mt-4 rounded-lg bg-[#0f3b97] px-4 py-1 text-center text-lg font-semibold text-white">
                  {progressData?.totalHighlights || 0} Highlights
                </div>
              </article>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OverView;
