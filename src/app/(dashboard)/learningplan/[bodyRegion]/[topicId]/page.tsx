import DetailedLearning from "@/features/learningplan/component/DetailedLearning";
import React from "react";

interface PageProps {
  params: Promise<{
    bodyRegion: string;
    topicId: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  const { bodyRegion, topicId } = await params;
  return (
    <div>
      <DetailedLearning bodyRegion={bodyRegion} topicId={topicId} />
    </div>
  );
};

export default Page;
