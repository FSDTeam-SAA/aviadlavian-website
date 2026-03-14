"use client";

import React, { useState } from "react";
import { User } from "lucide-react";
import { useTheme } from "next-themes";
import SettingEdit from "../common/SettingEdit";

const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 20;

const MainSettings = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [fontSize, setFontSize] = useState(16);

  React.useEffect(() => {
    const savedSize = window.localStorage.getItem("dashboard-font-size");
    if (savedSize) {
      const parsed = Number(savedSize);
      if (!Number.isNaN(parsed)) {
        setFontSize(parsed);
      }
    }
  }, []);

  React.useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    window.localStorage.setItem("dashboard-font-size", String(fontSize));
  }, [fontSize]);

  const isDark = resolvedTheme === "dark";

  const handleThemeToggle = (value: string) => {
    setTheme(value);
    document.documentElement.classList.toggle("dark", value === "dark");
  };

  return (
    <div className="w-full rounded-3xl border border-slate-200/80 bg-linear-to-b from-white to-slate-50 p-6 shadow-sm sm:p-8 dark:border-slate-700 dark:from-slate-900 dark:to-slate-950">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
        Settings
      </h1>

      {/* Appearance Section */}
      <div className="mt-8 rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/60">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Appearance
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Customize the look and feel of your interface
        </p>

        {/* Font Size */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Font Size
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Choose your preferred visual theme
          </p>
          <div className="mt-3 inline-flex items-center overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-900">
            <button
              type="button"
              onClick={() =>
                setFontSize((prev) => Math.max(MIN_FONT_SIZE, prev - 1))
              }
              className="px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Decrease font size"
            >
              -
            </button>
            <span className="border-x border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-900 dark:border-slate-600 dark:text-slate-100">
              A
            </span>
            <button
              type="button"
              onClick={() =>
                setFontSize((prev) => Math.min(MAX_FONT_SIZE, prev + 1))
              }
              className="px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Increase font size"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Account & Privacy Section */}
      <div className="mt-8 rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/60">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Account & Privacy
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-left text-slate-900 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">
            <User size={20} />
            <span className="font-medium">Profile Settings</span>
          </div>

          {/* <button
            type="button"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-left text-slate-900 transition hover:bg-red-50 hover:text-red-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-red-950/30 dark:hover:text-red-300"
          >
            <Trash2 size={20} />
            <span className="font-medium">Delete Account</span>
          </button> */}
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/40">
          <SettingEdit />
        </div>
      </div>

      {/* Theme Section */}
      <div className="mt-8 rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/60">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Theme
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Choose your preferred visual theme
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={isDark}
              onChange={() => handleThemeToggle("dark")}
              className="h-4 w-4 cursor-pointer border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-500 dark:border-slate-600"
            />
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Dark
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
            <input
              type="radio"
              name="theme"
              value="light"
              checked={!isDark}
              onChange={() => handleThemeToggle("light")}
              className="h-4 w-4 cursor-pointer border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-500 dark:border-slate-600"
            />
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Light
            </span>
          </label>
        </div>
      </div>

      {/* Language and Region */}
      {/* <div className="mt-8 grid gap-6 rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm sm:grid-cols-2 dark:border-slate-700 dark:bg-slate-900/60">
        <div>
          <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">
            Language
          </label>
          <Select defaultValue="english">
            <SelectTrigger className="mt-2 w-full rounded-lg border-slate-300 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-800">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="spanish">Spanish</SelectItem>
              <SelectItem value="french">French</SelectItem>
              <SelectItem value="german">German</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">
            Region
          </label>
          <Select defaultValue="usa">
            <SelectTrigger className="mt-2 w-full rounded-lg border-slate-300 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-800">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usa">USA</SelectItem>
              <SelectItem value="uk">UK</SelectItem>
              <SelectItem value="canada">Canada</SelectItem>
              <SelectItem value="australia">Australia</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div> */}
    </div>
  );
};

export default MainSettings;
