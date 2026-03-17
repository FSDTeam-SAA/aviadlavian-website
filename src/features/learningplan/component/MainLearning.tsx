// src/features/learningplan/component/MainLearning.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useLearningPlan } from "../hooks/useLearningPlan";
import { groupByBodyRegion } from "../utils/learningplanHelpers";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const MainLearning = () => {
  const router = useRouter();
  const [searchRaw, setSearchRaw] = useState("");
  const search = useDebounce(searchRaw, 400);

  const { data, isLoading, error } = useLearningPlan(search);

  const bodyRegions = React.useMemo(() => {
    if (!data?.data) return [];
    return groupByBodyRegion(data.data);
  }, [data]);

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h1 className="mb-8 text-3xl font-bold text-slate-900 dark:text-slate-100">
            Learning Plan
          </h1>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 gap-y-6 max-w-7xl">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div>
                    <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700 mb-2" />
                    <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
                <div className="h-9 w-32 rounded-lg bg-slate-200 dark:bg-slate-700" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h1 className="mb-8 text-3xl font-bold text-slate-900 dark:text-slate-100">
            Learning Plan
          </h1>
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950/20">
            <p className="text-red-600 dark:text-red-400">
              Failed to load learning plans. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <div>
          {/* Header */}
          <h1 className="mb-6 text-3xl font-bold text-slate-900 dark:text-slate-100">
            Learning Plan
          </h1>

          {/* Search */}
          <div className="relative mb-8 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchRaw}
              onChange={(e) => setSearchRaw(e.target.value)}
              placeholder="Search learning plans…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0077A3] focus:ring-2 focus:ring-[#0077A3]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
            />
          </div>

          {/* Learning Plans Grid */}
          <div className="max-w-7xl">
            {bodyRegions.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800">
                <p className="text-slate-500 dark:text-slate-400">
                  {search
                    ? `No learning plans found for "${search}".`
                    : "No learning plans found. Start studying to see your plans here."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 gap-y-6">
                {bodyRegions.map((group) => (
                  <div
                    key={group.region}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-100">
                        <img
                          src={group.imageUrl}
                          alt={group.region}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                          {group.region}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {group.chapterCount} Chapters
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        router.push(
                          `/learningplan/${encodeURIComponent(group.region.toLowerCase())}`,
                        )
                      }
                      className="rounded-lg cursor-pointer bg-[#0077A3] px-4 py-2 text-sm font-medium text-white hover:bg-[#005f82] transition-colors"
                    >
                      View Learning Plan
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLearning;
