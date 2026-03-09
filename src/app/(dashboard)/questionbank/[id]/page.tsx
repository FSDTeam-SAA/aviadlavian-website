import AllTopicQsAns from "./_components/all-topic-qs";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = await params;

  return (
    <div>
      <AllTopicQsAns topicId={resolvedParams.id} />
    </div>
  );
};

export default Page;
