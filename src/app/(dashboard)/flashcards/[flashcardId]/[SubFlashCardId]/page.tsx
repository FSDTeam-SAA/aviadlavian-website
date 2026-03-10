import FlashCardDetails from "@/features/flashcards/commponent/FlashCardDetails";
import SubFlashCard from "@/features/flashcards/commponent/SubFlashCard";
import React from "react";

const page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ flashcardId: string; SubFlashCardId: string }>;
  searchParams?: Promise<{
    subspecialty?: string | string[];
    chapter?: string | string[];
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

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-100 p-4 sm:p-6 lg:p-8 dark:bg-slate-950">
      {/* <SubFlashCard
        flashcardTitle="Flashcard"
        subspecialtyTitle={subspecialtyTitle}
        chapterTitle={chapterTitle}
      /> */}
      <FlashCardDetails
        lastid={SubFlashCardId}
        subspecialty={subspecialtyTitle}
        chapter={chapterTitle}
      />
    </main>
  );
};

export default page;
