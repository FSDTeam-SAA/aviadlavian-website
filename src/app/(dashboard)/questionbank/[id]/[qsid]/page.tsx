import React from "react";
import QuestionExplanation from "./_components/qs-details";

const page = async ({
  params,
}: {
  params: Promise<{ id: string; qsid: string }>;
}) => {
  const { qsid } = await params;

  return (
    <div>
      <QuestionExplanation qsid={qsid} />
    </div>
  );
};

export default page;
