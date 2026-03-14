"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Menu, Search, X, Sparkles, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUIStore } from "@/store/ui.store";
import { useMyProfile } from "../hooks/useSample";
import { useFilteredFlashcards } from "@/features/flashcards/hooks/useFlashCard";

// Shape returned by /flashcard/get-flashcards/
type FlashcardResult = {
  _id: string;
  question: string;
  answer: string;
  topicId: string;
  difficulty?: string;
  isActive?: boolean;
};

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── SearchBox: reusable for desktop & mobile ──────────────────────────────────
const SearchBox = ({
  inputRef,
  value,
  onChange,
  onClear,
  onClose,
  results,
  isLoading,
  isFetching,
  showDropdown,
  onResultClick,
  dropdownRef,
}: {
  inputRef?: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
  onClose?: () => void;
  results: FlashcardResult[];
  isLoading: boolean;
  isFetching: boolean;
  showDropdown: boolean;
  onResultClick: (item: FlashcardResult) => void;
  dropdownRef?: React.RefObject<HTMLDivElement | null>;
}) => (
  <div className="relative w-full">
    {/* Input */}
    <div className="relative">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-white/80"
        size={15}
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onClear();
            onClose?.();
          }
        }}
        placeholder="Search flashcards…"
        autoComplete="off"
        className="h-9 w-full rounded-full border border-white/55 bg-transparent pr-9 pl-9 text-sm text-white placeholder:text-white/80 outline-none transition focus:border-white focus:bg-white/5"
      />
      {/* Right side: spinner or clear */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        {isFetching && value.length >= 2 ? (
          <Loader2 size={13} className="animate-spin text-white/70" />
        ) : value ? (
          <button
            type="button"
            onClick={onClear}
            className="text-white/70 hover:text-white"
            aria-label="Clear search"
          >
            <X size={13} />
          </button>
        ) : null}
      </div>
    </div>

    {/* Dropdown */}
    {showDropdown && (
      <div
        ref={dropdownRef}
        className="absolute top-full left-0 right-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin" />
            Searching…
          </div>
        ) : results.length === 0 ? (
          <div className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
            No flashcards found for &ldquo;{value}&rdquo;
          </div>
        ) : (
          <ul>
            {results.map((item, i) => (
              <li key={item._id}>
                <button
                  type="button"
                  onClick={() => onResultClick(item)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-orange-50 dark:hover:bg-orange-950/20 ${
                    i !== 0
                      ? "border-t border-slate-100 dark:border-slate-800"
                      : ""
                  }`}
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                    <Sparkles size={12} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                      {item.question}
                    </p>
                    {item.answer && (
                      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                        {item.answer}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 self-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    Open →
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    )}
  </div>
);

// ── Main Header ───────────────────────────────────────────────────────────────
const Header = () => {
  const router = useRouter();
  const openSidebar = useUIStore((state) => state.openSidebar);
  const { data: profile } = useMyProfile();

  const [searchValue, setSearchValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const desktopWrapRef = useRef<HTMLDivElement>(null);
  const mobileWrapRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebounce(searchValue, 350);
  const shouldQuery = debouncedSearch.trim().length >= 2;

  // Fetch flashcards matching the search term
  const {
    data: searchData,
    isLoading,
    isFetching,
  } = useFilteredFlashcards({
    page: 1,
    limit: 8,
    status: "active",
    search: shouldQuery ? debouncedSearch.trim() : undefined,
  });

  const results: FlashcardResult[] = shouldQuery
    ? (searchData?.data as FlashcardResult[]) || []
    : [];

  const showDropdown = isFocused && searchValue.trim().length >= 2;

  // Navigate to flashcard detail
  const handleResultClick = useCallback(
    (item: FlashcardResult) => {
      router.push(`/flashcards/${item.topicId}/${item._id}`);
      setSearchValue("");
      setIsFocused(false);
      setMobileSearchOpen(false);
    },
    [router],
  );

  const clearSearch = useCallback(() => {
    setSearchValue("");
    setIsFocused(false);
  }, []);

  // Focus mobile input when panel opens
  useEffect(() => {
    if (mobileSearchOpen) {
      setTimeout(() => mobileInputRef.current?.focus(), 50);
    }
  }, [mobileSearchOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        desktopWrapRef.current &&
        !desktopWrapRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
      if (
        mobileWrapRef.current &&
        !mobileWrapRef.current.contains(e.target as Node)
      ) {
        setMobileSearchOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fullName = [profile?.FirstName, profile?.LastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  const initials = `${profile?.FirstName?.[0] ?? "A"}${profile?.LastName?.[0] ?? "L"}`;

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-30 h-16 border-b border-blue-950/40 bg-[#0f3b97] shadow-md">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={openSidebar}
          className="absolute top-3 left-5 z-40 inline-flex items-center justify-center rounded-lg border border-white/25 bg-[#0f3b97] p-2 text-white transition hover:bg-white/15 md:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-3 min-w-0 ml-15 md:ml-0">
            <h1 className="text-xl font-bold tracking-wide text-white">LOGO</h1>
          </div>

          {/* Desktop search with live dropdown */}
          <div
            ref={desktopWrapRef}
            className="mx-4 hidden max-w-md flex-1 md:block"
            onFocus={() => setIsFocused(true)}
          >
            <SearchBox
              inputRef={desktopInputRef}
              value={searchValue}
              onChange={setSearchValue}
              onClear={clearSearch}
              results={results}
              isLoading={isLoading && shouldQuery}
              isFetching={isFetching}
              showDropdown={showDropdown}
              onResultClick={handleResultClick}
            />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile search toggle */}
            <button
              type="button"
              onClick={() => {
                setMobileSearchOpen((v) => !v);
                setIsFocused(true);
              }}
              className="inline-flex items-center justify-center rounded-lg p-2 text-white transition hover:bg-white/15 md:hidden"
              aria-label="Toggle search"
            >
              {mobileSearchOpen ? <X size={18} /> : <Search size={18} />}
            </button>

            {/* Profile */}
            <button
              type="button"
              onClick={() => router.push("/settings")}
              className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-white transition hover:bg-white/15"
              aria-label="Go to settings page"
            >
              <span className="hidden text-xl font-medium text-white sm:inline">
                {fullName || "Aviad Lavian"}
              </span>
              <Avatar className="h-9 w-9 border-2 border-white/70">
                <AvatarFallback className="bg-slate-200 text-xs font-semibold text-slate-700">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile search bar — slides down below header */}
      {mobileSearchOpen && (
        <div
          ref={mobileWrapRef}
          className="fixed top-16 left-0 right-0 z-40 border-b border-blue-950/40 bg-[#0f3b97] px-4 py-3 md:hidden animate-in slide-in-from-top-2 duration-200"
          onFocus={() => setIsFocused(true)}
        >
          <SearchBox
            inputRef={mobileInputRef}
            value={searchValue}
            onChange={setSearchValue}
            onClear={() => {
              clearSearch();
              setMobileSearchOpen(false);
            }}
            onClose={() => setMobileSearchOpen(false)}
            results={results}
            isLoading={isLoading && shouldQuery}
            isFetching={isFetching}
            showDropdown={showDropdown}
            onResultClick={handleResultClick}
          />
        </div>
      )}
    </>
  );
};

export default Header;
