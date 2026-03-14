"use client";

import React from "react";
import { X, Bookmark } from "lucide-react";
import Link from "next/link";

type TOCChapter = {
  id: string;
  title: string;
  isBookmarked: boolean;
  href: string;
};

type TocPanelProps = {
  chapters: TOCChapter[];
  onToggleBookmark: (id: string) => void;
  onClose: () => void;
};

const TocPanel = ({ chapters, onToggleBookmark, onClose }: TocPanelProps) => {
  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Table of Contents
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-500 hover:text-slate-700"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-1">
        {chapters.map((chapter) => (
          <div
            key={chapter.id}
            className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
          >
            <Link
              href={chapter.href}
              onClick={onClose}
              className="grow px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100"
            >
              {chapter.title}
            </Link>
            <button
              type="button"
              onClick={() => onToggleBookmark(chapter.id)}
              className="px-3 py-2.5 text-slate-400 hover:text-[#007b5e] dark:hover:text-emerald-400 transition"
            >
              <Bookmark
                size={16}
                className={chapter.isBookmarked ? "fill-current" : ""}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TocPanel;
