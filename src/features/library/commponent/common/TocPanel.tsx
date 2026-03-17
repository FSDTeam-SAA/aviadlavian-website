"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  X,
  Bookmark,
  ChevronRight,
  Hash,
  LayoutList,
  Edit3,
  PencilLine,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useAnnotations,
  useLibrary,
} from "@/features/library/hooks/uselibrary";
import { LibraryArticle, LibraryTopic } from "@/features/library/type/library";

/**
 * Helper component to show notes and highlights counts
 */
const AnnotationCounts = ({ articleId }: { articleId: string }) => {
  const { data } = useAnnotations(articleId);
  const notesCount = data?.notes?.length || 0;
  const highlightsCount = data?.highlights?.length || 0;

  if (notesCount === 0 && highlightsCount === 0) return null;

  return (
    <div className="flex items-center gap-1.5 font-manrope">
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

/**
 * Represents a chapter/topic in the library
 */
type TOCChapter = {
  id: string;
  title: string;
  isBookmarked: boolean;
  href: string;
};

/**
 * Represents a heading item within the current article
 */
type TocItem = {
  id: string;
  text: string;
  level: number;
};

type TocPanelProps = {
  chapters: TOCChapter[];
  onToggleBookmark: (id: string) => void;
  onClose: () => void;
};

/**
 * TocPanel Component
 *
 * Automatically generates a Table of Contents from HTML headings (h1-h6)
 * found within the '.prose' content container.
 */
const TocPanel = ({ chapters, onToggleBookmark, onClose }: TocPanelProps) => {
  const [internalHeadings, setInternalHeadings] = useState<TocItem[]>([]);
  const pathname = usePathname();

  /**
   * Generates a structured TOC array from headings in the DOM.
   * Also ensures all headings have unique anchor IDs.
   */
  const generateTocData = useCallback((): TocItem[] => {
    const contentElement = document.querySelector(".prose");
    if (!contentElement) return [];

    const headingElements = contentElement.querySelectorAll(
      "h1, h2, h3, h4, h5, h6",
    );

    const slugify = (text: string) => {
      return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
    };

    return Array.from(headingElements).map((el, index) => {
      // 1. Ensure the heading has an ID for anchoring
      let id = el.id;
      if (!id) {
        const baseId = slugify(el.textContent || "section");
        id = `${baseId}-${index}`;
        el.id = id;
      }

      // 2. Return structured object
      return {
        id,
        text: el.textContent?.trim() || "",
        level: parseInt(el.tagName[1]),
      };
    });
  }, []);

  /**
   * Sync the TOC whenever the content or route changes
   */
  useEffect(() => {
    const updateToc = () => {
      const data = generateTocData();
      setInternalHeadings(data);
    };

    // Initial sync
    updateToc();

    // Set up observer for dynamic content (dangerouslySetInnerHTML)
    const contentElement = document.querySelector(".prose");
    if (contentElement) {
      const observer = new MutationObserver(updateToc);
      observer.observe(contentElement, {
        childList: true,
        subtree: true,
        characterData: true,
      });
      return () => observer.disconnect();
    }
  }, [generateTocData, pathname]);

  /**
   * Handles smooth scrolling to internal anchors
   */
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Offset for fixed headers
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Close sidebar on small screens after clicking
      if (window.innerWidth < 1024) {
        onClose();
      }
    }
  };

  const isChapterActive = (href: string) => pathname === href;

  /**
   * Extract articleId and chapterId from href (expected pattern: /library/ARTICLE_ID/TOPIC_ID)
   */
  const getArticleIdFromHref = (href: string) => {
    const parts = href.split("/");
    return parts[2] || "";
  };

  const getChapterIdFromPathname = (path: string) => {
    const parts = path.split("/");
    return parts[3] || "";
  };

  // Fetch all library data to find region-wide siblings
  const { data: libraryData } = useLibrary({ limit: 100 });
  const currentChapterId = getChapterIdFromPathname(pathname);

  const regionSiblings = useMemo(() => {
    if (!libraryData?.data || !currentChapterId) return [];

    const allArticles = libraryData.data;
    let currentRegion = "";

    // 1. Find the region of the current topic
    for (const article of allArticles as LibraryArticle[]) {
      const topic = article.topicIds?.find(
        (t: LibraryTopic) => t._id === currentChapterId,
      );
      if (topic) {
        currentRegion = topic.Primary_Body_Region;
        break;
      }
    }

    if (!currentRegion) return [];

    // 2. Get all topics in this region
    const siblings: {
      articleId: string;
      topicId: string;
      name: string;
      region: string;
    }[] = [];
    allArticles.forEach((article: LibraryArticle) => {
      article.topicIds?.forEach((topic: LibraryTopic) => {
        if (topic.Primary_Body_Region === currentRegion) {
          siblings.push({
            articleId: article._id,
            topicId: topic._id,
            name: topic.Name,
            region: topic.Primary_Body_Region,
          });
        }
      });
    });

    return siblings;
  }, [libraryData?.data, currentChapterId]);

  return (
    <div className="flex flex-col h-full max-h-[600px] overflow-hidden bg-white dark:bg-slate-900 font-manrope">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20">
            <LayoutList size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
              Table of Contents
            </h3>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
              Navigation & Sections
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800/50"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        {/* CURRENT ARTICLE SECTIONS */}
        {internalHeadings.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <span className="h-4 w-1 rounded-full bg-emerald-500" />
              <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">
                In this Article
              </h4>
            </div>
            <div className="space-y-1">
              {internalHeadings.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToHeading(item.id)}
                  style={{ paddingLeft: `${(item.level - 1) * 12 + 12}px` }}
                  className="group flex w-full items-start gap-2.5 rounded-lg py-2 px-3 text-sm transition-all hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 text-left"
                >
                  <Hash
                    size={14}
                    className="mt-1 shrink-0 text-slate-300 group-hover:text-emerald-500 dark:text-slate-700 transition-colors"
                  />
                  <span className="text-slate-600 group-hover:text-emerald-700 dark:text-slate-400 dark:group-hover:text-emerald-400 font-medium leading-relaxed line-clamp-2">
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ALL CHAPTERS SELECTION (Current Article Only) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <span className="h-4 w-1 rounded-full bg-blue-500" />
            <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">
              Article Chapters
            </h4>
          </div>
          <div className="grid gap-2">
            {chapters.map((chapter, index) => {
              const active = isChapterActive(chapter.href);
              const articleId = getArticleIdFromHref(chapter.href);

              return (
                <div
                  key={chapter.id}
                  className={`group relative flex items-center justify-between rounded-xl border transition-all duration-200 ${
                    active
                      ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/30 dark:bg-emerald-900/10 shadow-sm"
                      : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700 dark:hover:bg-slate-800/80"
                  }`}
                >
                  <Link
                    href={chapter.href}
                    onClick={onClose}
                    className="flex-1 px-4 py-3"
                  >
                    <div className="flex flex-col">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${
                          active ? "text-emerald-600" : "text-[#007b5e]"
                        }`}
                      >
                        Chapter {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`text-sm font-bold leading-tight transition-colors ${
                          active
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
                        }`}
                      >
                        {chapter.title}
                      </span>
                    </div>
                  </Link>
                  <div className="flex items-center pr-1.5 gap-1">
                    <AnnotationCounts articleId={articleId} />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        onToggleBookmark(chapter.id);
                      }}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                        chapter.isBookmarked
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-300 hover:bg-slate-100 hover:text-slate-500 dark:text-slate-700 dark:hover:bg-slate-800"
                      }`}
                      title={
                        chapter.isBookmarked
                          ? "Remove Bookmark"
                          : "Add Bookmark"
                      }
                    >
                      <Bookmark
                        size={16}
                        className={chapter.isBookmarked ? "fill-current" : ""}
                      />
                    </button>
                    {!active && (
                      <ChevronRight
                        size={16}
                        className="text-slate-400 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 mr-1"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* REGION-WIDE TOPICS (More from same region) */}
        {regionSiblings.length > (chapters.length > 0 ? 0 : -1) && (
          <section className="space-y-4 pb-2">
            <div className="flex items-center gap-2 px-2">
              <span className="h-4 w-1 rounded-full bg-amber-500" />
              <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">
                More from {regionSiblings[0]?.region}
              </h4>
            </div>
            <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              {regionSiblings.map((item, idx) => {
                const href = `/library/${item.articleId}/${item.topicId}`;
                const active = pathname === href;

                return (
                  <Link
                    key={`${item.articleId}-${item.topicId}`}
                    href={href}
                    onClick={onClose}
                    className={`group flex items-center justify-between px-5 py-4 transition hover:bg-white dark:hover:bg-slate-800/50 ${
                      idx !== regionSiblings.length - 1
                        ? "border-b border-slate-100 dark:border-slate-800"
                        : ""
                    } ${active ? "bg-white dark:bg-slate-800 shadow-inner" : ""}`}
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#007b5e]">
                        Chapter {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`mt-0.5 text-sm font-bold transition-colors ${
                          active
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <AnnotationCounts articleId={item.articleId} />
                      <ChevronRight
                        size={16}
                        className={`transition-all group-hover:translate-x-1 ${
                          active
                            ? "text-emerald-500"
                            : "text-slate-400 opacity-0 group-hover:opacity-100"
                        }`}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default TocPanel;
