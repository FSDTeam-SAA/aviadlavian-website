/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { LayoutGrid, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CreateCustomQuiz from "./create-custom-quizzes";

interface FilterOptionsResponse {
  message: string;
  statusCode: number;
  status: string;
  data: {
    bodyRegions: string[];
    acuityValues: string[];
    importanceLevels: string[];
  };
}

const CustomQuizzes = () => {
  const session = useSession();
  const token = session?.data?.accessToken;
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateFlow, setShowCreateFlow] = useState(false);
  const [examName, setExamName] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  // Updated query for filter-options
  const { data, isLoading } = useQuery<FilterOptionsResponse>({
    queryKey: ["filter-options"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/injury/filter-options`,
      );
      if (!response.ok) throw new Error("Failed to fetch filter options");
      return response.json();
    },
  });

  // Extract body regions from response
  const bodyRegions = useMemo(() => {
    return data?.data?.bodyRegions || [];
  }, [data]);

  // Start Exam Mutation
  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/examattempt/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to start exam");
      }

      return result;
    },
    onSuccess: (data) => {
      toast.success("Exam started successfully!");
      router.push(`/custom-quizzes/${data?.data?._id}`);
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleConfirm = () => {
    const defaultDate = new Date().toLocaleDateString("en-GB");

    mutation.mutate({
      topicId: selectedTopic,
      examName: examName.trim() || defaultDate,
      timeLimitMinutes: 120,
    });
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setTimeout(() => {
        setStep(1);
        setExamName("");
        setSelectedTopic("");
      }, 300);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-900">Custom Quizzes</h1>

      <div className="flex flex-col lg:flex-row items-stretch gap-6 mt-6">
        <div className="border px-5 py-6 rounded-lg bg-white flex items-center justify-between lg:w-1/2 shadow-sm">
          <p className="text-slate-600 lg:max-w-md">
            You can test your knowledge with a timed practice exam using
            randomized questions.
          </p>

          <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button className="bg-[#0e308d] hover:bg-[#0a246b] hover:cursor-pointer transition-colors">
                New Practice Exam
              </Button>
            </DialogTrigger>

            <DialogContent
              className={`${step === 1 ? "sm:max-w-[800px]" : "sm:max-w-[550px]"} p-8 transition-all duration-300`}
            >
              {step === 1 ? (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-slate-800">
                      Practice Exam
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-6 py-4">
                    <p className="text-slate-600">
                      MSK Nexus Practice exams are excellent preparation for the
                      ACIM exam.
                    </p>
                    <div className="space-y-5">
                      <div className="flex gap-4">
                        <LayoutGrid className="w-6 h-6 mt-1 text-slate-800 shrink-0" />
                        <p className="text-slate-600">
                          60 randomized questions from across 1 subspecialties
                          based on ABIM exam blueprint.
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <Clock className="w-6 h-6 mt-1 text-slate-800 shrink-0" />
                        <p className="text-slate-600">
                          1h 20 minute time limit with the ability to pause the
                          timer.
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <CheckCircle2 className="w-6 h-6 mt-1 text-slate-800 shrink-0" />
                        <p className="text-slate-600">
                          Correct answers count toward CME/MOC progress.
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-slate-800">Good Luck!</p>
                  </div>

                  <DialogFooter className="flex sm:justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                      className="px-10 border-[#0e308d] text-[#0e308d] hover:bg-slate-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => setStep(2)}
                      className="px-10 bg-[#0e308d] hover:bg-[#0a246b]"
                    >
                      Start
                    </Button>
                  </DialogFooter>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-full border rounded-xl overflow-hidden mb-8 text-lg bg-white">
                    <div className="flex border-b items-center">
                      <div className="w-1/3 p-4 border-r text-slate-700 font-medium bg-slate-50/50">
                        Exam Name :
                      </div>
                      <div className="w-2/3 p-2">
                        <Input
                          placeholder={`(Optional) e.g. ${new Date().toLocaleDateString("en-GB")}`}
                          value={examName}
                          onChange={(e) => setExamName(e.target.value)}
                          className="border-none focus-visible:ring-0 text-slate-900 text-lg placeholder:text-slate-400 placeholder:text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex border-b items-center">
                      <div className="w-1/3 p-4 border-r text-slate-700 font-medium bg-slate-50/50">
                        Exam Time :
                      </div>
                      <div className="w-2/3 p-4 text-slate-900 font-semibold tracking-wide">
                        01 : 20 : 00
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-1/3 p-4 border-r text-slate-700 font-medium bg-slate-50/50">
                        Exam Topic :
                      </div>
                      <div className="w-2/3 p-2">
                        {isLoading ? (
                          <Skeleton className="h-10 w-full rounded-md" />
                        ) : (
                          <Select
                            value={selectedTopic}
                            onValueChange={setSelectedTopic}
                          >
                            <SelectTrigger className="border-none focus:ring-0 text-lg shadow-none w-full">
                              <SelectValue placeholder="Select Topic" />
                            </SelectTrigger>
                            <SelectContent>
                              {bodyRegions.map((region) => (
                                <SelectItem key={region} value={region}>
                                  {region}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    disabled={!selectedTopic || mutation.isPending}
                    onClick={handleConfirm}
                    className="px-12 py-6 bg-[#0e308d] hover:bg-[#0a246b] text-lg rounded-md w-full sm:w-auto min-w-[200px]"
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      "Confirm"
                    )}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div className="border px-5 py-6 rounded-lg bg-white flex items-center justify-between lg:w-1/2 shadow-sm">
          <p className="text-slate-600 lg:max-w-md">
            Create custom quizzes based on specific body regions or difficulty
            levels.
          </p>
          <Button
            onClick={() => setShowCreateFlow(true)}
            className="bg-[#0e308d] hover:bg-[#0a246b] hover:cursor-pointer"
          >
            Create New Quiz
          </Button>
        </div>
      </div>

      <div>
        {showCreateFlow && (
          <CreateCustomQuiz
            topics={bodyRegions}
            token={token}
            onBack={() => setShowCreateFlow(false)}
          />
        )}
      </div>
    </div>
  );
};

export default CustomQuizzes;
