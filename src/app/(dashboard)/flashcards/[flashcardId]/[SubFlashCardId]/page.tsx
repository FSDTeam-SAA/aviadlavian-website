import FlashCardDetails from "@/features/flashcards/commponent/FlashCardDetails";
import React from "react";

const page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ flashcardId: string; SubFlashCardId: string }>;
  searchParams?: Promise<{
    subspecialty?: string | string[];
    chapter?: string | string[];
    totalFlashcards?: string | string[];
    filteredFlashcards?: string | string[];
    status?: string | string[];
    acuity?: string | string[];
    ageGroup?: string | string[];
    sortBy?: string | string[];
    search?: string | string[];
  }>;
}) => {
  const { flashcardId, SubFlashCardId } = await params;
  const search = searchParams ? await searchParams : undefined;

  const subspecialtyTitle = Array.isArray(search?.subspecialty)
    ? search?.subspecialty[0]
    : search?.subspecialty;

  const chapterTitle = Array.isArray(search?.chapter)
    ? search?.chapter[0]
    : search?.chapter;

  const totalFlashcardsRaw = Array.isArray(search?.totalFlashcards)
    ? search?.totalFlashcards[0]
    : search?.totalFlashcards;

  const filteredFlashcardsRaw = Array.isArray(search?.filteredFlashcards)
    ? search?.filteredFlashcards[0]
    : search?.filteredFlashcards;

  const totalFlashcards = Number(totalFlashcardsRaw || 0);
  const filteredFlashcards = Number(filteredFlashcardsRaw || 0);

  const status = Array.isArray(search?.status)
    ? search?.status[0]
    : search?.status;
  const acuity = Array.isArray(search?.acuity)
    ? search?.acuity[0]
    : search?.acuity;
  const ageGroup = Array.isArray(search?.ageGroup)
    ? search?.ageGroup[0]
    : search?.ageGroup;
  const sortBy = Array.isArray(search?.sortBy)
    ? search?.sortBy[0]
    : search?.sortBy;
  const searchQuery = Array.isArray(search?.search)
    ? search?.search[0]
    : search?.search;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-100 p-4 sm:p-6 lg:p-8 dark:bg-slate-950">
      <FlashCardDetails
        lastid={SubFlashCardId}
        flashcardId={flashcardId}
        subspecialty={subspecialtyTitle}
        chapter={chapterTitle}
        totalFlashcards={totalFlashcards}
        filteredFlashcards={filteredFlashcards}
        status={status}
        acuity={acuity}
        ageGroup={ageGroup}
        sortBy={sortBy}
        search={searchQuery}
      />
    </main>
  );
};

export default page;
