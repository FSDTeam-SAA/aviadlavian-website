"use client";

import React, { useState } from "react";
import { Heart } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import FlashCard from "../common/FlashCard";
import { useInjuryFilters, useFilteredFlashcards } from "../hooks/useFlashCard";
import { useQueries } from "@tanstack/react-query";
import { getInjuriesByRegion } from "../api/flashcard";

type InjuryData = {
  _id: string;
  Id: string;
  Name: string;
  Primary_Body_Region: string;
  Secondary_Body_Region: string;
  Acuity: string;
  Age_Group: string;
  Tissue_Type: string[];
  Etiology_Mechanism: string;
  Common_Sports: string[];
  Synonyms_Abbreviations: string[];
  Importance_Level: string;
  Description: string;
  Video_URL: string;
  Tags_Keywords: string[];
  Image_URL: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
};

const MainFlashCard = () => {
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const { data: filters } = useInjuryFilters();

  // Fetch the first flashcard for "Flashcard of the day"
  const { data: firstCardData, isLoading: firstCardLoading } =
    useFilteredFlashcards({
      page: 1,
      limit: 1,
      status: "active",
    });
  const firstCard = (
    firstCardData?.data as Array<{ question: string; answer: string }>
  )?.[0];
  const todayQuestion = firstCard?.question;
  const todayAnswer = firstCard?.answer;
  const bodyRegions = filters?.data?.bodyRegions || [];

  // Fetch injuries for all body regions using useQueries
  const injuriesQueries = useQueries({
    queries: bodyRegions.map((region: string) => ({
      queryKey: ["injuriesByRegion", region],
      queryFn: () => getInjuriesByRegion(region),
      enabled: !!region,
    })),
  });

  // Create a map of region -> injuries data
  const injuriesByRegionMap = bodyRegions.reduce(
    (acc: Record<string, InjuryData[]>, region: string, index: number) => {
      const queryResult = injuriesQueries[index];
      if (queryResult?.data) {
        const responseData = queryResult.data as { data: InjuryData[] };
        acc[region] = responseData.data || [];
      }
      return acc;
    },
    {},
  );
  return (
    <div className="w-full">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        {/* Header */}
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Flashcards
        </h1>

        {/* Flashcard of the day */}
        <div className="mt-6 max-w-2xl">
          <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">
            Flashcard of the day
          </h2>

          <div
            onClick={() => setIsAnswerRevealed(!isAnswerRevealed)}
            className="cursor-pointer overflow-hidden rounded-xl border border-orange-300 transition hover:shadow-lg dark:border-orange-900/50"
          >
            {/* Question Section */}
            <div className="bg-orange-50 p-6 dark:bg-orange-950/20">
              <div className="mb-4 flex justify-center">
                <Heart
                  size={48}
                  className="text-orange-600 dark:text-orange-400"
                />
              </div>

              {firstCardLoading ? (
                <div className="space-y-2">
                  <div className="mx-auto h-3 w-3/4 animate-pulse rounded-full bg-orange-200 dark:bg-orange-900/40" />
                  <div className="mx-auto h-3 w-1/2 animate-pulse rounded-full bg-orange-200 dark:bg-orange-900/40" />
                </div>
              ) : (
                <p className="text-center text-sm leading-relaxed text-orange-900 dark:text-orange-100">
                  {todayQuestion || "No flashcard available"}
                </p>
              )}
            </div>

            {/* Answer Section */}
            <div className="bg-blue-50 p-6 dark:bg-blue-950/20">
              {!isAnswerRevealed ? (
                <p className="w-full rounded-lg py-3 text-center font-semibold text-blue-600 transition dark:text-blue-400">
                  Click any card to reveal the answer
                </p>
              ) : (
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                    {todayAnswer || "—"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Choose a subspecialty to study */}
        <div className="mt-8">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
            Choose a subspecialty to study
          </h2>

          <Accordion type="single" collapsible className="space-y-2">
            {bodyRegions.map((region: string) => {
              const injuries = injuriesByRegionMap[region] || [];

              // Map injuries to include IDs and titles
              const injuryItems = injuries.map((injury: InjuryData) => {
                const secondaryRegion = injury.Secondary_Body_Region
                  ? ` - ${injury.Secondary_Body_Region}`
                  : "";
                return {
                  id: injury._id,
                  title: `${injury.Name}${secondaryRegion}`,
                };
              });

              // Get chapter titles for display
              const chapterTitles = injuryItems.map(
                (item: { id: string; title: string }) => item.title,
              );

              // Get injury IDs for navigation
              const injuryIds = injuryItems.map(
                (item: { id: string; title: string }) => item.id,
              );

              return (
                <FlashCard
                  key={region}
                  id={region}
                  title={region}
                  chapters={injuries.length}
                  chapterTitles={chapterTitles}
                  injuryIds={injuryIds}
                />
              );
            })}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default MainFlashCard;
