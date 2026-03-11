"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Circle,
  CloudCog,
  Edit3,
  PencilLine,
} from "lucide-react";
import { useLibrary } from "../hooks/uselibrary";
import { LibraryArticle } from "../type/library";

const Library = () => {
  const { data, isLoading, isError, error } = useLibrary({
    page: 1,
    limit: 100,
  });

  // Group articles by their actual Primary_Body_Region
  const { groupedData, regions } = useMemo(() => {
    const allArticles = data?.data ?? [];
    const groups: Record<string, LibraryArticle[]> = {};

    allArticles.forEach((article) => {
      const region = article.topicIds?.[0]?.Primary_Body_Region || "Other";
      if (!groups[region]) groups[region] = [];
      groups[region].push(article);
    });

    return {
      groupedData: groups,
      regions: Object.keys(groups).sort(),
    };
  }, [data?.data]);

  if (isLoading) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600 dark:border-slate-800" />
        <p className="text-slate-500">Loading library articles...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center dark:border-red-900/30 dark:bg-red-900/10">
        <h3 className="text-lg font-bold text-red-900 dark:text-red-400">
          Failed to load articles
        </h3>
        <p className="mt-2 text-red-700 dark:text-red-300/80">
          {error instanceof Error
            ? error.message
            : "An unknown error occurred."}
        </p>
      </div>
    );
  }
  console.log("region ", regions);

  return (
    <div className="mx-auto w-full">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Text
        </h1>
        <p className="mt-4 text-lg font-medium text-slate-700 dark:text-slate-300">
          Choose a body region to study
        </p>
      </header>

      <div className="space-y-2">
        {regions.map((region) => {
          const articles = groupedData[region];
          if (!articles || articles.length === 0) return null;
          console.log("articles ", articles);
          return (
            <section key={region}>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                {articles.map((article, idx) => (
                  <Link
                    key={article._id}
                    href={`/library/${article._id}`}
                    className={`group flex items-center justify-between px-5 py-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                      idx !== articles.length - 1
                        ? "border-b border-slate-100 dark:border-slate-800"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                        {article.image?.secure_url ? (
                          <Image
                            src={article.image.secure_url}
                            alt={article.name}
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded-sm object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                          />
                        ) : (
                          <Circle size={18} className="text-slate-300" />
                        )}
                      </div>
                      <div>
                        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                          {region}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {article.topicIds?.length || 0} Chapters
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-slate-400 transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Text Notes and Highlights Section */}
      <div className="mt-16">
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

export default Library;
