"use client";

import React, { useMemo, useState, useRef } from "react";
import { nanoid } from "nanoid";
import Link from "next/link";
import { BookOpen, ClipboardList, PencilLine, Edit3, X } from "lucide-react";
import Notes from "./Notes";
import NotesPanel from "./common/NotesPanel";
import LearningPlanPanel from "./common/LearningPlanPanel";
import TocPanel from "./common/TocPanel";
import {
  useLibrary,
  useAnnotations,
  useSaveAnnotations,
} from "../hooks/uselibrary";
import type { AnnotationHighlight, AnnotationNote } from "../hooks/uselibrary";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type SubLibraryDetailsProps = {
  libraryId: string;
  chapterId: string;
};

const COLORS = [
  { name: "Yellow", value: "#fef08a", border: "#facc15", text: "#854d0e" },
  { name: "Blue", value: "#bfdbfe", border: "#60a5fa", text: "#1e40af" },
  { name: "Green", value: "#bbf7d0", border: "#4ade80", text: "#166534" },
  { name: "Pink", value: "#fbcfe8", border: "#f472b6", text: "#9d174d" },
  { name: "Purple", value: "#e9d5ff", border: "#c084fc", text: "#6b21a8" },
  { name: "Orange", value: "#ffedd5", border: "#fb923c", text: "#9a3412" },
  { name: "Cyan", value: "#cffafe", border: "#22d3ee", text: "#155e75" },
  { name: "Lavender", value: "#ede9fe", border: "#a78bfa", text: "#5b21b6" },
  { name: "Rose", value: "#ffe4e6", border: "#fb7185", text: "#9f1239" },
];

const SubLibraryDetails = ({
  libraryId,
  chapterId,
}: SubLibraryDetailsProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [showTOC, setShowTOC] = useState(false);
  const [showLearningPlan, setShowLearningPlan] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [showNotesPage, setShowNotesPage] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [floatingMenu, setFloatingMenu] = useState<{
    x: number;
    y: number;
    text: string;
    range: { from: number; to: number };
  } | null>(null);

  const queryClient = useQueryClient();
  const { data: libraryData, isLoading: isLibraryLoading } = useLibrary({
    limit: 100,
  });
  const { data: annotationData, isLoading: isAnnotationsLoading } =
    useAnnotations(libraryId);
  const saveMutation = useSaveAnnotations(libraryId);

  const article = useMemo(
    () => (libraryData?.data ?? []).find((a) => a._id === libraryId),
    [libraryData?.data, libraryId],
  );

  // Derive highlights and notes from server data — memoised so deps are stable
  const highlights = useMemo<AnnotationHighlight[]>(
    () => annotationData?.highlights ?? [],
    [annotationData?.highlights],
  );
  const notes = useMemo<AnnotationNote[]>(
    () => annotationData?.notes ?? [],
    [annotationData?.notes],
  );

  const topic = useMemo(
    () => article?.topicIds?.find((t) => t._id === chapterId),
    [article, chapterId],
  );

  const chapters = useMemo(
    () =>
      article?.topicIds?.map((t) => ({
        id: t._id,
        title: t.Name,
        isBookmarked: false,
        href: `/library/${libraryId}/${t._id}`,
      })) || [],
    [article, libraryId],
  );

  const toggleBookmark = (id: string) => {
    console.log("Toggle bookmark for:", id);
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    const note: AnnotationNote = {
      id: `n-${Date.now()}`,
      content: newNote,
    };
    saveMutation.mutate(
      {
        highlights,
        notes: [...notes, note],
      },
      {
        onSuccess: () => {
          toast.success("Note added successfully");
        },
        onError: () => {
          toast.error("Failed to add note");
        },
      },
    );
    setNewNote("");
    setSelectedSection("");
    setShowNotesPanel(false);
  };

  const getSelectionOffsets = (selection: Selection) => {
    if (!contentRef.current || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);

    // Safety check: only allow selection within contentRef
    if (!contentRef.current.contains(range.commonAncestorContainer))
      return null;

    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(contentRef.current);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;
    return { from: start, to: start + range.toString().length };
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !contentRef.current) {
      setFloatingMenu(null);
      return;
    }

    const text = selection.toString().trim();
    if (!text) return;

    const rangeOffsets = getSelectionOffsets(selection);
    if (!rangeOffsets) return;

    const rect = selection.getRangeAt(0).getBoundingClientRect();

    // Calculate responsive position with bounds checking
    let x = rect.left + rect.width / 2;
    const y = rect.top - 60;

    const padding = 16;
    const estimatedWidth = Math.min(window.innerWidth - padding * 2, 380);

    // Keep menu within viewport horizontally
    if (x - estimatedWidth / 2 < padding) {
      x = estimatedWidth / 2 + padding;
    } else if (x + estimatedWidth / 2 > window.innerWidth - padding) {
      x = window.innerWidth - estimatedWidth / 2 - padding;
    }

    setFloatingMenu({
      x,
      y: y + window.scrollY,
      text: selection.toString(),
      range: rangeOffsets,
    });
  };

  const handleAddHighlight = (color: string) => {
    if (!floatingMenu) return;

    // Check if a highlight with the EXACT same range already exists
    const existing = highlights.find(
      (h) =>
        h.text === floatingMenu.text &&
        "from" in h.range &&
        "to" in h.range &&
        h.range.from === floatingMenu.range.from &&
        h.range.to === floatingMenu.range.to,
    );

    const newHighlight: AnnotationHighlight = {
      id: existing?.id ?? nanoid(),
      text: floatingMenu.text,
      range: floatingMenu.range,
      color,
    };

    const updatedHighlights = existing
      ? highlights.map((h) => (h.id === existing.id ? newHighlight : h))
      : [...highlights, newHighlight];

    // Optimistically update the query cache for immediate feedback
    queryClient.setQueryData(
      ["article-annotations", libraryId],
      (prev: typeof annotationData) => ({
        ...(prev ?? {}),
        highlights: updatedHighlights,
        notes: notes,
      }),
    );

    saveMutation.mutate(
      { highlights: updatedHighlights, notes },
      {
        onSuccess: () => {
          toast.success("Highlight saved");
        },
        onError: () => {
          toast.error("Failed to save highlight");
        },
      },
    );
    setFloatingMenu(null);
    window.getSelection()?.removeAllRanges();
  };

  const processedDescription = useMemo(() => {
    return (
      topic?.Description || article?.description || "No description available."
    );
  }, [topic?.Description, article?.description]);

  // Handle DOM-based highlighting to isolate specific occurrences
  React.useEffect(() => {
    if (!contentRef.current) return;

    // Reset to original HTML before applying highlights
    // This allows the character offsets to be accurate every time
    contentRef.current.innerHTML = processedDescription;

    if (!highlights.length) return;

    // Helper to find the Text node and offset for a given character index
    const getTextNodeAtOffset = (root: Node, offset: number) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let currentOffset = 0;
      let node = walker.nextNode();

      while (node) {
        const length = node.textContent?.length || 0;
        if (currentOffset + length >= offset) {
          return { node, offset: offset - currentOffset };
        }
        currentOffset += length;
        node = walker.nextNode();
      }
      return null;
    };

    // Use document fragment for bulk operations if needed, but here we just wrap
    highlights.forEach((h) => {
      try {
        if (!("from" in h.range) || !("to" in h.range)) return;

        const start = getTextNodeAtOffset(contentRef.current!, h.range.from);
        const end = getTextNodeAtOffset(contentRef.current!, h.range.to);

        if (start && end) {
          const range = document.createRange();
          range.setStart(start.node, start.offset);
          range.setEnd(end.node, end.offset);

          const colorObj = COLORS.find((c) => c.value === h.color) || COLORS[0];
          const span = document.createElement("span");
          span.style.backgroundColor = `${h.color}`;
          span.style.color = colorObj.text;
          span.style.padding = "0 1px";
          span.style.borderRadius = "2px";
          span.style.fontWeight = "500";
          span.style.transition = "all 0.2s";
          // span.style.borderBottom = `2px solid ${colorObj.border}80`;
          span.id = `hl-${h.id}`;

          // Wrap the range content in the span
          range.surroundContents(span);
        }
      } catch (err) {
        console.warn("Could not apply highlight to range:", h.range, err);
      }
    });

    return () => {
      // Clean up happens automatically when dangerouslySetInnerHTML re-renders
    };
  }, [processedDescription, highlights]);

  if (isLibraryLoading || isAnnotationsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
      </div>
    );
  }

  if (!article || !topic) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <h2 className="text-xl font-bold">Topic not found</h2>
        <Link
          href={`/library/${libraryId}`}
          className="mt-4 text-emerald-600 hover:underline"
        >
          Return to Table of Contents
        </Link>
      </div>
    );
  }

  if (showNotesPage) {
    return (
      <Notes
        notes={notes.map((n) => ({
          id: n.id,
          content: n.content,
          section: "General",
          createdAt: new Date(),
        }))}
        onBack={() => setShowNotesPage(false)}
        title={article.name}
        subtitle={topic.Name}
      />
    );
  }

  return (
    <div className="w-full">
      <div className="relative overflow-visible rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
          {article?.topicIds?.[0]?.Primary_Body_Region}
        </h2>

        {/* Floating Highlight Menu */}
        {floatingMenu && (
          <div
            className="fixed z-50 flex items-center justify-center rounded-2xl bg-slate-900/95 backdrop-blur-md px-3 py-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 animate-in fade-in zoom-in slide-in-from-bottom-2 duration-300 max-w-[calc(100vw-32px)]"
            style={{
              left: `${floatingMenu.x}px`,
              top: `${floatingMenu.y}px`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => handleAddHighlight(c.value)}
                    className="h-7 w-7 sm:h-8 sm:w-8 rounded-full  border-transparent transition-all hover:scale-110 hover:border-white active:scale-95 shadow-sm"
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
              </div>
              <div className="h-6 w-px bg-white/20 hidden sm:block mx-1" />
              <button
                onClick={() => setFloatingMenu(null)}
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-red-500/80 transition-colors"
                title="Cancel"
              >
                <X size={16} />
              </button>
            </div>
            {/* Tooltip arrow */}
            <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-slate-900" />
          </div>
        )}

        <nav className="flex items-center gap-1.5 text-xs font-bold mb-8">
          <Link
            href="/library"
            className="text-[#007b5e] hover:underline uppercase"
          >
            Text
          </Link>
          <span className="text-slate-400">›</span>
          <span className="text-[#007b5e] uppercase">
            {topic.Primary_Body_Region}
          </span>
          <span className="text-slate-400">›</span>
          <Link
            href={`/library/${libraryId}`}
            className="text-[#007b5e] hover:underline uppercase"
          >
            {article.name}
          </Link>
          <span className="text-slate-400">›</span>
          <span className="text-slate-600 dark:text-slate-300 uppercase truncate max-w-[200px]">
            {topic.Name}
          </span>
        </nav>

        <div className="relative flex flex-col lg:flex-row gap-8">
          <div className="grow">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
              {topic.Name}
            </h2>

            <div
              ref={contentRef}
              onMouseUp={handleTextSelection}
              className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300 dark:prose-invert
                prose-headings:text-slate-900 dark:prose-headings:text-white
                prose-h3:text-xl prose-h3:font-bold prose-h3:mt-8
                prose-p:leading-relaxed prose-p:mb-4
                selection:bg-emerald-100 dark:selection:bg-emerald-900/40"
            />
          </div>

          <div className="flex lg:flex-col gap-px h-fit rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-800 sticky top-4">
            <button
              onClick={() => {
                setShowTOC(!showTOC);
                setShowLearningPlan(false);
                setShowNotesPanel(false);
              }}
              className={`flex flex-col items-center justify-center p-3 transition hover:bg-slate-50 dark:hover:bg-slate-700 ${showTOC ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" : "text-slate-600 dark:text-slate-400"}`}
              title="Table of Contents"
            >
              <BookOpen size={20} />
              <span className="text-[9px] font-bold mt-1">TOC</span>
            </button>
            <button
              onClick={() => {
                setShowLearningPlan(!showLearningPlan);
                setShowTOC(false);
                setShowNotesPanel(false);
              }}
              className={`flex flex-col items-center justify-center p-3 border-t lg:border-t lg:border-l-0 border-l border-slate-100 dark:border-slate-700 transition hover:bg-slate-50 dark:hover:bg-slate-700 ${showLearningPlan ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" : "text-slate-600 dark:text-slate-400"}`}
              title="Learning Plan"
            >
              <ClipboardList size={20} />
              <span className="text-[9px] font-bold mt-1 line-clamp-1">
                Learning Plan
              </span>
            </button>
            <button
              onClick={() => {
                setShowNotesPanel(!showNotesPanel);
                setShowTOC(false);
                setShowLearningPlan(false);
              }}
              className={`flex flex-col items-center justify-center p-3 border-t lg:border-t lg:border-l-0 border-l border-slate-100 dark:border-slate-700 transition hover:bg-slate-50 dark:hover:bg-slate-700 ${showNotesPanel ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" : "text-slate-600 dark:text-slate-400"}`}
              title="Notes"
            >
              <Edit3 size={20} />
              <span className="text-[9px] font-bold mt-1">Notes</span>
            </button>
          </div>
        </div>

        {(showTOC || showLearningPlan || showNotesPanel) && (
          <div className="fixed inset-x-4 bottom-4 top-20 z-50 overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 lg:absolute lg:inset-x-6 lg:top-48 lg:bottom-auto lg:max-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/80 p-4 backdrop-blur-md dark:bg-slate-900/80 lg:hidden">
              <span className="font-bold">
                {showTOC
                  ? "Table of Contents"
                  : showLearningPlan
                    ? "Learning Plan"
                    : "Notes"}
              </span>
              <button
                onClick={() => {
                  setShowTOC(false);
                  setShowLearningPlan(false);
                  setShowNotesPanel(false);
                }}
                className="rounded-full bg-slate-100 p-2 dark:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-2 lg:p-0">
              {showNotesPanel && (
                <NotesPanel
                  newNote={newNote}
                  setNewNote={setNewNote}
                  selectedSection={selectedSection}
                  setSelectedSection={setSelectedSection}
                  onSave={addNote}
                  onClose={() => setShowNotesPanel(false)}
                />
              )}
              {showLearningPlan && (
                <LearningPlanPanel
                  libraryId={libraryId}
                  chapterId={chapterId}
                  onClose={() => setShowLearningPlan(false)}
                />
              )}
              {showTOC && (
                <TocPanel
                  chapters={chapters}
                  onToggleBookmark={toggleBookmark}
                  onClose={() => setShowTOC(false)}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
          Text Notes and Highlights:
        </h2>

        <div className="grid gap-6 sm:grid-cols-2">
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
            <button
              onClick={() => setShowNotesPage(true)}
              className="mt-auto flex h-12 items-center justify-center rounded-xl bg-[#007b5e] font-bold text-white transition hover:bg-[#00634b]"
            >
              {notes.length} Notes
            </button>
          </div>

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
              {
                highlights.filter((h) => article?.description?.includes(h.text))
                  .length
              }{" "}
              Highlights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubLibraryDetails;
