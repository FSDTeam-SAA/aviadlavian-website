"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Circle,
  Search,
  Filter,
  X,
  Edit3,
  PencilLine,
  Loader2,
} from "lucide-react";
import { useLibrary, useAnnotations } from "../hooks/uselibrary";
import { LibraryArticle, LibraryTopic } from "../type/library";
import {
  filterLibraryArticles,
  getFilterOptions,
  LibraryFilters,
} from "../utils/library-filters";

const AnnotationCounts = ({ articleId }: { articleId: string }) => {
  const { data } = useAnnotations(articleId);
  const notesCount = data?.notes?.length || 0;
  const highlightsCount = data?.highlights?.length || 0;

  if (notesCount === 0 && highlightsCount === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {notesCount > 0 && (
        <span className="flex items-center gap-1 text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-bold">
          <Edit3 size={10} /> {notesCount}
        </span>
      )}
      {highlightsCount > 0 && (
        <span className="flex items-center gap-1 text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-bold">
          <PencilLine size={10} /> {highlightsCount}
        </span>
      )}
    </div>
  );
};

const Library = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [activeFilters, setActiveFilters] = React.useState<LibraryFilters>({});
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, isError, error, isFetching } = useLibrary({
    page: 1,
    limit: 100,
    search: debouncedSearch,
  });

  const [expandedRegions, setExpandedRegions] = React.useState<
    Record<string, boolean>
  >({});

  const toggleRegion = (region: string) => {
    setExpandedRegions((prev) => ({
      ...prev,
      [region]: !prev[region],
    }));
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setActiveFilters({});
  };

  // Get filtering options from original data
  const filterOptions = useMemo(() => {
    return getFilterOptions(data?.data ?? []);
  }, [data?.data]);

  // Group topics by their actual Primary_Body_Region across filtered articles
  const { groupedData, regions } = useMemo(() => {
    const allArticles = data?.data ?? [];
    const filteredArticles = filterLibraryArticles(allArticles, activeFilters);

    const groups: Record<
      string,
      { article: LibraryArticle; topic: LibraryTopic }[]
    > = {};

    filteredArticles.forEach((article) => {
      article.topicIds?.forEach((topic) => {
        // Apply client-side filtering on topics
        const matchAcuity =
          !activeFilters.acuity || topic.Acuity === activeFilters.acuity;
        const matchAgeGroup =
          !activeFilters.ageGroup || topic.Age_Group === activeFilters.ageGroup;
        const matchTissueType =
          !activeFilters.tissueType ||
          topic.Tissue_Type?.includes(activeFilters.tissueType);
        const matchImportance =
          !activeFilters.importance ||
          topic.Importance_Level === activeFilters.importance;

        if (
          !(matchAcuity && matchAgeGroup && matchTissueType && matchImportance)
        )
          return;

        const region = topic.Primary_Body_Region || "Other";
        if (!groups[region]) {
          groups[region] = [];
        }
        groups[region].push({ article, topic });
      });
    });

    return {
      groupedData: groups,
      regions: Object.keys(groups).sort(),
    };
  }, [data?.data, activeFilters]);

  if (isLoading && !data) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-4 text-center">
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

  return (
    <div className="mx-auto w-full font-manrope">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Library
        </h1>
        <p className="mt-4 text-lg font-medium text-slate-700 dark:text-slate-300">
          Search and filter topics to study
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
              placeholder="Search by name or description..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isFetching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium transition dark:border-slate-800 dark:bg-slate-900 ${
              isFilterOpen
                ? "border-emerald-500 text-emerald-600"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Filter size={18} />
            Filters
            {(activeFilters.acuity ||
              activeFilters.ageGroup ||
              activeFilters.tissueType ||
              activeFilters.importance) && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">
                !
              </span>
            )}
          </button>
          {(searchQuery ||
            activeFilters.acuity ||
            activeFilters.ageGroup ||
            activeFilters.tissueType ||
            activeFilters.importance) && (
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
        {isFilterOpen && (
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-800/30 sm:grid-cols-2 lg:grid-cols-4">
            {/* Acuity Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Acuity
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900"
                value={activeFilters.acuity || ""}
                onChange={(e) =>
                  setActiveFilters({
                    ...activeFilters,
                    acuity: e.target.value || undefined,
                  })
                }
              >
                <option value="">All Acuities</option>
                {filterOptions.acuities.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Age Group Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Age Group
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900"
                value={activeFilters.ageGroup || ""}
                onChange={(e) =>
                  setActiveFilters({
                    ...activeFilters,
                    ageGroup: e.target.value || undefined,
                  })
                }
              >
                <option value="">All Age Groups</option>
                {filterOptions.ageGroups.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Tissue Type Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tissue Type
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900"
                value={activeFilters.tissueType || ""}
                onChange={(e) =>
                  setActiveFilters({
                    ...activeFilters,
                    tissueType: e.target.value || undefined,
                  })
                }
              >
                <option value="">All Tissue Types</option>
                {filterOptions.tissueTypes.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Importance Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Importance
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900"
                value={activeFilters.importance || ""}
                onChange={(e) =>
                  setActiveFilters({
                    ...activeFilters,
                    importance: e.target.value || undefined,
                  })
                }
              >
                <option value="">All Importance Levels</option>
                {filterOptions.importanceLevels.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {regions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
            <p className="text-slate-500">
              No topics found matching your criteria.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-4 font-bold text-emerald-600 hover:text-emerald-500"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          regions.map((region) => {
            const items = groupedData[region];
            if (!items || items.length === 0) return null;
            const isExpanded = expandedRegions[region];

            return (
              <section key={region}>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-all duration-300">
                  {/* Region Header Row */}
                  <button
                    onClick={() => toggleRegion(region)}
                    className={`w-full group flex items-center justify-between px-5 py-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                      isExpanded
                        ? "border-b border-slate-100 dark:border-slate-800"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                        {items[0].article.image?.secure_url ? (
                          <Image
                            src={items[0].article.image.secure_url}
                            alt={region}
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded-sm object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                          />
                        ) : (
                          <Circle size={18} className="text-slate-300" />
                        )}
                      </div>
                      <div className="text-left">
                        <h2 className="mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                          {region}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {items.length} Chapters
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronRight
                          size={18}
                          className="text-[#007b5e] rotate-90 transition-transform"
                        />
                      ) : (
                        <ChevronRight
                          size={18}
                          className="text-slate-400 transition-transform group-hover:translate-x-1"
                        />
                      )}
                    </div>
                  </button>

                  {/* Chapter Links */}
                  {isExpanded && (
                    <div className="bg-slate-50/30 dark:bg-slate-950/20">
                      {items.map((item, idx) => (
                        <Link
                          key={`${item.article._id}-${item.topic._id}`}
                          href={`/library/${item.article._id}/${item.topic._id}`}
                          className={`group flex items-center justify-between px-5 py-4 pl-20 transition hover:bg-white dark:hover:bg-slate-800/50 ${
                            idx !== items.length - 1
                              ? "border-b border-slate-100 dark:border-slate-800"
                              : ""
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#007b5e]">
                              Chapter {String(idx + 1).padStart(2, "0")}
                            </span>
                            <span className="mt-0.5 text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                              {item.topic.Name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <AnnotationCounts articleId={item.article._id} />
                            <ChevronRight
                              size={16}
                              className="text-slate-400 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1"
                            />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            );
          })
        )}
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
            <Link
              href="/learningplan"
              className="mt-auto flex h-12 items-center justify-center rounded-xl bg-[#007b5e] font-bold text-white transition hover:bg-[#00634b]"
            >
              View in Learning Plan
            </Link>
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
            <Link
              href="/learningplan"
              className="mt-auto flex h-12 items-center justify-center rounded-xl bg-[#007b5e] font-bold text-white transition hover:bg-[#00634b]"
            >
              View in Learning Plan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Library;
