"use client";

import React, { useState } from "react";
import { Heart, Search, Filter, X, Loader2 } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import FlashCard from "../common/FlashCard";
import { useInjuryFilters, useFilteredFlashcards } from "../hooks/useFlashCard";
import { useQueries } from "@tanstack/react-query";
import { getInjuriesByRegion } from "../api/flashcard";

type InjuryData = {
  _id: string;
  Id: string;
  Name: string;
  Primary_Body_Region: string;
  Secondary_Body_Region: string;
  Acuity: string;
  Age_Group: string;
  Tissue_Type: string[];
  Etiology_Mechanism: string;
  Common_Sports: string[];
  Synonyms_Abbreviations: string[];
  Importance_Level: string;
  Description: string;
  Video_URL: string;
  Tags_Keywords: string[];
  Image_URL: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
};

const MainFlashCard = () => {
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<{
    acuity?: string;
    ageGroup?: string;
  }>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: filters } = useInjuryFilters();

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch the first flashcard for "Flashcard of the day"
  const { data: firstCardData, isLoading: firstCardLoading } =
    useFilteredFlashcards({
      page: 1,
      limit: 1,
      status: "active",
    });
  const firstCard = (
    firstCardData?.data as Array<{ question: string; answer: string }>
  )?.[0];
  const todayQuestion = firstCard?.question;
  const todayAnswer = firstCard?.answer;
  const bodyRegions = filters?.data?.bodyRegions || [];

  // Fetch injuries for all body regions using useQueries
  const injuriesQueries = useQueries({
    queries: bodyRegions.map((region: string) => ({
      queryKey: ["injuriesByRegion", region],
      queryFn: () => getInjuriesByRegion(region),
      enabled: !!region,
    })),
  });

  const handleClearFilters = () => {
    setSearchQuery("");
    setActiveFilters({});
  };

  // Create a map of region -> injuries data, filtered by search and active filters
  const injuriesByRegionMap = bodyRegions.reduce(
    (acc: Record<string, InjuryData[]>, region: string, index: number) => {
      const queryResult = injuriesQueries[index];
      if (queryResult?.data) {
        const responseData = queryResult.data as { data: InjuryData[] };
        const allInjuries = responseData.data || [];

        // Apply search and status filters on the client side for each region
        const filteredInjuries = allInjuries.filter((injury) => {
          const matchSearch =
            !debouncedSearch ||
            injury.Name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            injury.Description.toLowerCase().includes(
              debouncedSearch.toLowerCase(),
            );

          const matchAcuity =
            !activeFilters.acuity || injury.Acuity === activeFilters.acuity;
          const matchAgeGroup =
            !activeFilters.ageGroup ||
            injury.Age_Group === activeFilters.ageGroup;

          return matchSearch && matchAcuity && matchAgeGroup;
        });

        if (filteredInjuries.length > 0) {
          acc[region] = filteredInjuries;
        }
      }
      return acc;
    },
    {},
  );

  const isAnyQueryFetching = injuriesQueries.some((q) => q.isFetching);
  const filteredRegions = Object.keys(injuriesByRegionMap).sort();
  return (
    <div className="w-full">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Flashcards
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Search and filter topics to review your flashcards
          </p>
        </header>

        {/* Search and Filter Controls */}
        <div className="mb-8 space-y-4">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by topic or region..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm outline-none focus:border-orange-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isAnyQueryFetching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                </div>
              )}
            </div>
            {/* <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium transition dark:border-slate-800 dark:bg-slate-900 ${
              isFilterOpen
                ? "border-orange-500 text-orange-600"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Filter size={18} />
            Filters
            {(activeFilters.acuity || activeFilters.ageGroup) && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] text-white">
                !
              </span>
            )}
          </button> */}
            {(searchQuery ||
              activeFilters.acuity ||
              activeFilters.ageGroup) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400"
              >
                <X size={18} />
                Clear
              </button>
            )}
          </form>

          {/* Expanded Filters */}
          {/* {isFilterOpen && (
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-800/30 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Acuity
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm outline-none focus:border-orange-500 dark:border-slate-800 dark:bg-slate-900"
                value={activeFilters.acuity || ""}
                onChange={(e) =>
                  setActiveFilters({
                    ...activeFilters,
                    acuity: e.target.value || undefined,
                  })
                }
              >
                <option value="">All Acuities</option>
                {filters?.data?.acuities?.map((opt: string) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Age Group
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm outline-none focus:border-orange-500 dark:border-slate-800 dark:bg-slate-900"
                value={activeFilters.ageGroup || ""}
                onChange={(e) =>
                  setActiveFilters({
                    ...activeFilters,
                    ageGroup: e.target.value || undefined,
                  })
                }
              >
                <option value="">All Age Groups</option>
                {filters?.data?.ageGroups?.map((opt: string) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )} */}
        </div>

        {/* Flashcard of the day */}
        {!searchQuery && !activeFilters.acuity && !activeFilters.ageGroup && (
          <div className="mt-8 max-w-xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Flashcard of the day
            </h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-orange-200 shadow-sm dark:border-orange-900/30">
              {/* Question Section */}
              <div className="bg-orange-50/50 p-6 sm:p-10 dark:bg-orange-950/10">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100/50 text-3xl dark:bg-orange-900/20">
                    🫀
                  </div>
                </div>
                <p className="text-center text-lg font-medium leading-relaxed text-slate-800 dark:text-slate-200">
                  {todayQuestion || "Loading question..."}
                </p>
              </div>

              {/* Answer Section */}
              <div className="bg-white p-6 sm:p-8 dark:bg-slate-900 border-t border-orange-100 dark:border-orange-900/20">
                {!isAnswerRevealed ? (
                  <button
                    type="button"
                    onClick={() => setIsAnswerRevealed(true)}
                    className="mx-auto block w-full sm:w-64 rounded-xl bg-orange-700 py-3 text-center font-bold text-white shadow-lg shadow-orange-700/20 transition hover:bg-orange-800 active:scale-95"
                  >
                    Reveal Answer
                  </button>
                ) : (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-500 text-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                      Answer
                    </span>
                    <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                      {todayAnswer}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Body Regions Sections */}
        <div className="mt-12 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Browse by Subspecialty
            </h2>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {filteredRegions.length} Regions
            </span>
          </div>
          {filteredRegions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
              <p className="text-slate-500">
                No regions found matching your criteria.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-4 font-bold text-orange-600 hover:text-orange-500"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-4">
              {filteredRegions.map((region) => (
                <FlashCard
                  key={region}
                  id={region}
                  title={region}
                  chapters={injuriesByRegionMap[region]?.length || 0}
                  chapterTitles={
                    injuriesByRegionMap[region]?.map(
                      (injury: InjuryData) => injury.Name,
                    ) || []
                  }
                  injuryIds={
                    injuriesByRegionMap[region]?.map(
                      (injury: InjuryData) => injury._id,
                    ) || []
                  }
                />
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainFlashCard;
