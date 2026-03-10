"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, ClipboardList, PencilLine, Edit3 } from "lucide-react";
import Notes from "./Notes";
import NotesPanel from "./common/NotesPanel";
import LearningPlanPanel from "./common/LearningPlanPanel";
import TocPanel from "./common/TocPanel";
import { useLibrary } from "../hooks/uselibrary";

type SubLibraryDetailsProps = {
  libraryId: string;
  chapterId: string;
};

type Highlight = {
  id: string;
  text: string;
  color: string;
  createdAt: Date;
};

type Note = {
  id: string;
  content: string;
  section: string;
  createdAt: Date;
};

const SubLibraryDetails = ({
  libraryId,
  chapterId,
}: SubLibraryDetailsProps) => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [showTOC, setShowTOC] = useState(false);
  const [showLearningPlan, setShowLearningPlan] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [showNotesPage, setShowNotesPage] = useState(false);
  const [isRead, setIsRead] = useState(false);

  const { data, isLoading } = useLibrary({ limit: 100 });
  const article = useMemo(
    () => (data?.data ?? []).find((a) => a._id === libraryId),
    [data?.data, libraryId],
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
        isBookmarked: false, // Default to false for now
      })) || [],
    [article],
  );

  const toggleBookmark = (id: string) => {
    // Logic to toggle bookmark for a chapter
    console.log("Toggle bookmark for:", id);
  };

  const addNote = () => {
    if (!newNote.trim() || !selectedSection) return;
    const note: Note = {
      id: `note-${Date.now()}`,
      content: newNote,
      section: selectedSection,
      createdAt: new Date(),
    };
    setNotes((prev) => [...prev, note]);
    setNewNote("");
    setSelectedSection("");
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    const selectedText = selection.toString().trim();
    if (selectedText.length === 0) return;

    const newHighlight: Highlight = {
      id: `highlight-${Date.now()}`,
      text: selectedText,
      color: "#fef3c7",
      createdAt: new Date(),
    };
    setHighlights((prev) => [...prev, newHighlight]);
    selection.removeAllRanges();
  };

  if (isLoading) {
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
        notes={notes}
        onBack={() => setShowNotesPage(false)}
        title={article.name}
        subtitle={topic.Name}
      />
    );
  }

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
          {article?.topicIds?.[0]?.Primary_Body_Region}
        </h2>
        {/* Top Header with Search */}
        {/* <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white">
            {article.name}
          </h1>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search"
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
        </div> */}

        {/* Breadcrumbs */}
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

        {/* Content Section */}
        <div className="relative flex flex-col lg:flex-row gap-8">
          <div className="grow">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
              {topic.Name}
            </h2>

            <div
              onMouseUp={handleTextSelection}
              className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300 dark:prose-invert
                prose-headings:text-slate-900 dark:prose-headings:text-white
                prose-h3:text-xl prose-h3:font-bold prose-h3:mt-8
                prose-p:leading-relaxed prose-p:mb-4"
              dangerouslySetInnerHTML={{
                __html: article?.description || "No description available.",
              }}
            />
          </div>

          {/* Floating Right Actions */}
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

        {/* Modal Overlays */}
        {(showTOC || showLearningPlan || showNotesPanel) && (
          <div className="absolute inset-x-6 top-48 z-20 max-h-[600px] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
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
                isRead={isRead}
                setIsRead={setIsRead}
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
        )}
      </div>

      {/* Bottom Sections: Text Notes and Highlights */}
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
            <button
              onClick={() => setShowNotesPage(true)}
              className="mt-auto flex h-12 items-center justify-center rounded-xl bg-[#007b5e] font-bold text-white transition hover:bg-[#00634b]"
            >
              {notes.length} Notes
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
              {highlights.length} Highlights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubLibraryDetails;
