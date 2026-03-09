// src/app/(dashboard)/learningplan/[bodyRegion]/page.tsx
import SingleLearning from "@/features/learningplan/component/SingleLearning";

interface PageProps {
  params: Promise<{
    bodyRegion: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  const { bodyRegion } = await params;
  return (
    <div>
      <SingleLearning bodyRegion={bodyRegion} />
    </div>
  );
};

export default Page;
