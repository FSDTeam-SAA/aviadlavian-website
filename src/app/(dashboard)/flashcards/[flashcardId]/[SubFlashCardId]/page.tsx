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

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-100 p-4 sm:p-6 lg:p-8 dark:bg-slate-950">
      {/* <SubFlashCard
        flashcardTitle="Flashcard"
        subspecialtyTitle={subspecialtyTitle}
        chapterTitle={chapterTitle}
      /> */}
      <FlashCardDetails
        lastid={SubFlashCardId}
        flashcardId={flashcardId}
        subspecialty={subspecialtyTitle}
        chapter={chapterTitle}
        totalFlashcards={totalFlashcards}
        filteredFlashcards={filteredFlashcards}
      />
    </main>
  );
};

export default page;
