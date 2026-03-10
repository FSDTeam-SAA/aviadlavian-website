"use client";

import Link from "next/link";
import React, { useMemo } from "react";
import { ChevronRight, CirclePlay, PencilLine, Edit3 } from "lucide-react";
import { useLibrary } from "../hooks/uselibrary";

type SubLibraryProps = {
  libraryId: string;
};

const SubLibrary = ({ libraryId }: SubLibraryProps) => {
  const { data, isLoading } = useLibrary({ limit: 100 });

  const article = useMemo(
    () => (data?.data ?? []).find((a) => a._id === libraryId),
    [data?.data, libraryId],
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <h2 className="text-xl font-bold">Article not found</h2>
        <Link href="/library" className="mt-4 text-emerald-600 hover:underline">
          Return to Library
        </Link>
      </div>
    );
  }

  const regionName =
    article.topicIds?.[0]?.Primary_Body_Region || "Unknown Region";

  return (
    <div className="w-full">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        {/* Header Section */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white sm:text-5xl">
              {article.name}
            </h1>
            <nav className="flex items-center gap-1.5 text-xs font-bold">
              <Link
                href="/library"
                className="text-[#007b5e] hover:underline uppercase"
              >
                Text
              </Link>
              <span className="text-slate-400">›</span>
              <span className="text-[#007b5e] uppercase">{regionName}</span>
              <span className="text-slate-400">›</span>
              <span className="text-slate-600 dark:text-slate-300 uppercase truncate max-w-[200px]">
                {article.name}
              </span>
            </nav>
          </div>

          {/* Video Tutorial Card */}
          <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 min-w-[260px]">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20">
              <CirclePlay
                size={32}
                fill="currentColor"
                className="text-white dark:text-slate-950"
              />
              <CirclePlay size={32} className="absolute text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Video Tutorial
              </p>
              <p className="text-[10px] font-medium text-slate-500">
                How to study with our website
              </p>
            </div>
          </div>
        </div>

        <h3 className="mt-8 text-2xl font-bold text-slate-900 dark:text-white">
          Table of Contents
        </h3>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
          {article.topicIds?.map((item, index) => {
            const chapterNum = String(index + 1).padStart(2, "0");

            return (
              <Link
                key={item._id}
                href={`/library/${libraryId}/${item._id}`}
                className={`group flex items-center justify-between px-5 py-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                  index !== (article.topicIds?.length || 0) - 1
                    ? "border-b border-slate-100 dark:border-slate-800"
                    : ""
                }`}
              >
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#007b5e]">
                    Chapter {chapterNum}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {item.Name}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Demo logic for "Has Highlight" tagging */}
                  {index === 1 && (
                    <span className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                      <PencilLine size={12} />
                      Has Highlight
                    </span>
                  )}
                  <ChevronRight
                    size={20}
                    className="text-slate-400 transition-transform group-hover:translate-x-1"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Text Notes and Highlights Section */}
      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
          Text Notes and Highlights:
        </h2>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Notes Card */}
          <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <div className="mb-4 flex items-center justify-center lg:justify-start gap-3">
              <Edit3 size={28} className="text-slate-900 dark:text-white" />
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                Notes
              </h3>
            </div>
            <p className="mb-8 text-center lg:text-left text-sm font-medium text-slate-600 dark:text-slate-400">
              Your notes, organized by content type and subspecialty
            </p>
            <button className="mt-auto flex h-12 items-center justify-center rounded-xl bg-[#007b5e] font-bold text-white transition hover:bg-[#00634b]">
              0 Notes
            </button>
          </div>

          {/* Highlights Card */}
          <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <div className="mb-4 flex items-center justify-center lg:justify-start gap-3">
              <PencilLine
                size={28}
                className="text-slate-900 dark:text-white"
              />
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                Highlights
              </h3>
            </div>
            <p className="mb-8 text-center lg:text-left text-sm font-medium text-slate-600 dark:text-slate-400">
              Content you&apos;ve highlighted, organized by type and
              subspecialty
            </p>
            <button className="mt-auto flex h-12 items-center justify-center rounded-xl bg-[#007b5e] font-bold text-white transition hover:bg-[#00634b]">
              1 Highlights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubLibrary;
