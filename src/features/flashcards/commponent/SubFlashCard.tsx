"use client";

import React, { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { useAllFlashcards, useFilteredFlashcards } from "../hooks/useFlashCard";

type InjuryData = {
  _id: string;
  question: string;
  answer: string;
  topicId: string;
  difficulty: string;
  isActive: boolean;
  userAnswer: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
};

type SubFlashCardProps = {
  flashcardId?: string;
  flashcardTitle?: string;
  subspecialtyTitle?: string;
  chapterTitle?: string;
};

// ─── Filter option sets ───────────────────────────────────────────────────────
const ACUITY_OPTIONS = ["Acute", "Chronic", "Subacute", "Overuse"];
const AGE_GROUP_OPTIONS = ["Pediatric", "Adolescent", "Adult", "Geriatric"];
const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];
const SORT_OPTIONS = [
  { label: "Default", value: "" },
  { label: "Newest", value: "dessce" },
  { label: "Oldest", value: "assend" },
];

// ─── Tiny hook: debounce ──────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Chip / pill toggle button ────────────────────────────────────────────────
const Chip = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
      active
        ? "border-orange-600 bg-orange-600 text-white shadow-sm"
        : "border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-orange-700 dark:hover:text-orange-400"
    }`}
  >
    {label}
  </button>
);

// ─── Main component ───────────────────────────────────────────────────────────
const SubFlashCard = ({
  flashcardId,
  subspecialtyTitle = "Knee",
  chapterTitle = "Chondromalacia Patella",
}: SubFlashCardProps) => {
  // ── Filter state ─────────────────────────────────────────────────────────
  const [searchRaw, setSearchRaw] = useState("");
  const [status, setStatus] = useState("");
  const [acuity, setAcuity] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const search = useDebounce(searchRaw, 400);

  // Whether any filter/search is active
  const hasFilters = !!(search || status || acuity || ageGroup || sortBy);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const { data: injuriesData, isLoading: baseLoading } = useAllFlashcards(
    flashcardId || "",
  );

  const { data: filteredData, isLoading: filterLoading } =
    useFilteredFlashcards({
      page: 1,
      limit: 200,
      ...(status && { status }),
      ...(flashcardId && { filterBytopicId: flashcardId }),
      ...(acuity && { filterByAcuity: acuity }),
      ...(ageGroup && { filterByAgeGroup: ageGroup }),
      ...(sortBy && { sortBy }),
      ...(search && { search }),
    });

  const allFlashcards: InjuryData[] =
    (injuriesData?.data as InjuryData[]) || [];
  const filteredFlashcards: InjuryData[] =
    (filteredData?.data as InjuryData[]) || [];

  // Pick the right dataset
  const injuries: InjuryData[] = hasFilters
    ? filteredFlashcards
    : allFlashcards;
  const isLoading = hasFilters ? filterLoading : baseLoading;
  const totalFlashcards = allFlashcards.length;
  const filteredFlashcardsCount = filteredFlashcards.length;
  const resumeTargetId =
    allFlashcards.find((i) => !i.userAnswer)?._id ||
    allFlashcards[0]?._id ||
    "";

  // ── Helpers ───────────────────────────────────────────────────────────────
  const clearFilters = useCallback(() => {
    setSearchRaw("");
    setStatus("");
    setAcuity("");
    setAgeGroup("");
    setSortBy("");
  }, []);

  const activeFilterCount = [status, acuity, ageGroup, sortBy].filter(
    Boolean,
  ).length;

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 dark:border-slate-700 dark:bg-slate-900">
        {/* ── Page title ── */}
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Flashcards
        </h1>

        {/* ── Breadcrumb ── */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-bold text-orange-700 dark:text-orange-400">
          <Link
            href="/flashcards"
            className="hover:underline uppercase tracking-tight"
          >
            Flashcards
          </Link>
          <span className="text-slate-400 font-normal px-0.5">›</span>
          <span className="uppercase tracking-tight">{subspecialtyTitle}</span>
          {chapterTitle && (
            <>
              <span className="text-slate-400 font-normal px-0.5">›</span>
              <span className="uppercase tracking-tight text-slate-500 dark:text-slate-500">
                {chapterTitle}
              </span>
            </>
          )}
        </div>

        <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          {totalFlashcards} flashcards in this chapter
        </p>

        {/* ── Progress card ── */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5 dark:border-slate-700 dark:bg-slate-800/60">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {chapterTitle} Flashcards
          </h2>

          <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
            Total: <span className="font-bold">{totalFlashcards}</span>{" "}
            flashcards
          </p>

          {hasFilters && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Showing {injuries.length} after filters
            </p>
          )}

          {resumeTargetId && (
            <Link
              href={{
                pathname: `/flashcards/${flashcardId}/${resumeTargetId}`,
                query: {
                  subspecialty: subspecialtyTitle,
                  chapter: chapterTitle,
                  totalFlashcards: String(totalFlashcards),
                  filteredFlashcards: String(filteredFlashcardsCount),
                  status,
                  acuity,
                  ageGroup,
                  sortBy,
                  search,
                },
              }}
              className="mt-4 inline-block rounded-full bg-orange-700 px-6 py-2 text-sm font-semibold text-white transition hover:bg-orange-800"
            >
              Resume Flashback
            </Link>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/*  FILTER + SEARCH SECTION                                           */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <div className="mt-6">
          {/* Row: title + search + filter toggle */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Choose an injury to study
            </h2>

            <div className="flex items-center gap-2">
              {/* Search input */}
              <div className="relative flex-1 sm:w-56 sm:flex-none">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search flashcards…"
                  value={searchRaw}
                  onChange={(e) => setSearchRaw(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-8 text-sm text-slate-800 placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-orange-600 dark:focus:ring-orange-900/30"
                />
                {searchRaw && (
                  <button
                    type="button"
                    onClick={() => setSearchRaw("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Filter toggle button */}
              <button
                type="button"
                onClick={() => setFilterPanelOpen((v) => !v)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                  filterPanelOpen || activeFilterCount > 0
                    ? "border-orange-500 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-950/20 dark:text-orange-400"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                <SlidersHorizontal size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown
                  size={13}
                  className={`transition-transform ${filterPanelOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Clear all */}
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 transition hover:border-red-300 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-red-700 dark:hover:text-red-400"
                >
                  <X size={12} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* ── Expandable filter panel ── */}
          {filterPanelOpen && (
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:gap-6">
                {/* Status */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Status
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((opt) => (
                      <Chip
                        key={opt.value}
                        label={opt.label}
                        active={status === opt.value}
                        onClick={() =>
                          setStatus(status === opt.value ? "" : opt.value)
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* Acuity */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Acuity
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ACUITY_OPTIONS.map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        active={acuity === opt}
                        onClick={() => setAcuity(acuity === opt ? "" : opt)}
                      />
                    ))}
                  </div>
                </div>

                {/* Age Group */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Age Group
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {AGE_GROUP_OPTIONS.map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        active={ageGroup === opt}
                        onClick={() => setAgeGroup(ageGroup === opt ? "" : opt)}
                      />
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Sort By
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SORT_OPTIONS.map((opt) => (
                      <Chip
                        key={opt.value}
                        label={opt.label}
                        active={sortBy === opt.value}
                        onClick={() =>
                          setSortBy(sortBy === opt.value ? "" : opt.value)
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Active filter summary pills ── */}
          {hasFilters && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Active:
              </span>
              {search && (
                <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                  Search: &ldquo;{search}&rdquo;
                  <button onClick={() => setSearchRaw("")} className="ml-0.5">
                    <X size={10} />
                  </button>
                </span>
              )}
              {status && (
                <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                  Status: {status}
                  <button onClick={() => setStatus("")} className="ml-0.5">
                    <X size={10} />
                  </button>
                </span>
              )}
              {acuity && (
                <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                  Acuity: {acuity}
                  <button onClick={() => setAcuity("")} className="ml-0.5">
                    <X size={10} />
                  </button>
                </span>
              )}
              {ageGroup && (
                <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                  Age: {ageGroup}
                  <button onClick={() => setAgeGroup("")} className="ml-0.5">
                    <X size={10} />
                  </button>
                </span>
              )}
              {sortBy && (
                <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                  Sort: {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                  <button onClick={() => setSortBy("")} className="ml-0.5">
                    <X size={10} />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* ── Flashcard list ── */}
          {isLoading ? (
            <div className="mt-4 text-center text-slate-600 dark:text-slate-400">
              Loading injuries...
            </div>
          ) : injuries.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 py-10 text-center dark:border-slate-700">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {hasFilters
                  ? "No flashcards match your filters."
                  : "No injuries found"}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-3 text-xs font-semibold text-orange-600 hover:underline dark:text-orange-400"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {injuries.map((injury, index) => (
                <li
                  key={injury._id}
                  className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="w-full flex justify-between items-center">
                      <div>
                        <p className="text-sm text-slate-800 dark:text-slate-200">
                          <span className="font-medium">Q{index + 1}:</span>{" "}
                          {injury.question}
                        </p>
                        <Link
                          href={{
                            pathname: `/flashcards/${flashcardId}/${injury._id}`,
                            query: {
                              subspecialty: subspecialtyTitle,
                              chapter: chapterTitle,
                              totalFlashcards: String(totalFlashcards),
                              filteredFlashcards: String(
                                filteredFlashcardsCount,
                              ),
                              status,
                              acuity,
                              ageGroup,
                              sortBy,
                              search,
                            },
                          }}
                          className="mt-1 inline-block text-sm font-semibold text-orange-700 transition hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
                        >
                          Reveal answer
                        </Link>
                      </div>
                      <div>
                        <p>{injury.userAnswer || "Not answered yet"}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubFlashCard;
