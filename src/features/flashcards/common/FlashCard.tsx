"use client";

import React from "react";
import Link from "next/link";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type FlashCardProps = {
  id: string;
  title: string;
  chapters: number;
  icon?: string;
  chapterTitles?: string[];
  injuryIds?: string[];
};

const FlashCard = ({
  id,
  title,
  chapters,
  icon,
  chapterTitles,
  injuryIds,
}: FlashCardProps) => {
  const contentTitles =
    chapterTitles && chapterTitles.length > 0
      ? chapterTitles
      : Array.from(
          { length: chapters },
          (_, index) => `${title} - Chapter ${index + 1}`,
        );

  return (
    <AccordionItem
      value={id}
      className="overflow-hidden rounded-xl border border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-900"
    >
      <AccordionTrigger className="py-3 hover:no-underline">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
            {icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={icon}
                alt={title}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {title.charAt(0)}
              </span>
            )}
          </div>

          <div className="min-w-0 text-left">
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {chapters} {chapters === 1 ? "Chapter" : "Chapters"}
            </p>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent>
        <div className="mt-1 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/70">
          <ul className="space-y-2">
            {contentTitles.map((chapter, index) => (
              <li key={`${injuryIds?.[index] || index}`}>
                <Link
                  href={{
                    pathname: `/flashcards/${injuryIds?.[index] || index}`,
                    query: {
                      subspecialty: title,
                      chapter,
                    },
                  }}
                  className="block rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <span className="mr-2 text-slate-500 dark:text-slate-400">
                    {index + 1}.
                  </span>
                  {chapter}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default FlashCard;
