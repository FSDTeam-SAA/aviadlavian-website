"use client";

import React from "react";
import { X } from "lucide-react";

type NotesPanelProps = {
  newNote: string;
  setNewNote: (value: string) => void;
  selectedSection: string;
  setSelectedSection: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
};

const NotesPanel = ({
  newNote,
  setNewNote,
  selectedSection,
  setSelectedSection,
  onSave,
  onClose,
}: NotesPanelProps) => {
  return (
    <div className="p-6 z-50">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Add Note
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-500 hover:text-slate-700"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Choose a Section
          </label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">Choose a Section</option>
            <option value="Overview">Overview</option>
            <option value="Lifestyle">Lifestyle</option>
            <option value="Risk Factors">Risk Factors</option>
            <option value="Extensor Mechanism">Extensor Mechanism</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Type Note Here
          </label>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Type..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            rows={4}
          />
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={!newNote.trim() || !selectedSection}
          className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default NotesPanel;
