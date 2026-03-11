/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Props {
  topics: string[];
  token: string | undefined;
  onBack: () => void;
}

const StepWrapper = ({
  num,
  title,
  isActive,
  isCompleted,
  children,
}: {
  num: number;
  title: string;
  isActive: boolean;
  isCompleted: boolean;
  children: React.ReactNode;
}) => (
  <div className="flex gap-6">
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ",
          isActive
            ? "bg-[#6b21a8] border-[#6b21a8] text-white shadow-md"
            : isCompleted
              ? "bg-green-500 border-green-500 text-white"
              : "border-slate-200 text-slate-400",
        )}
      >
        {isCompleted ? <Check className="w-5 h-5" /> : num}
      </div>
      {num !== 4 && (
        <div
          className={cn(
            "w-0.5 h-full min-h-10 my-2",
            isCompleted ? "bg-green-500" : "bg-slate-100",
          )}
        />
      )}
    </div>
    <div className="pb-10 flex-1">
      <h3
        className={cn(
          "text-lg font-semibold mb-4",
          isActive ? "text-slate-900" : "text-slate-400",
        )}
      >
        {title}
      </h3>
      {isActive && (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-left-4">
          {children}
        </div>
      )}
    </div>
  </div>
);

const CreateCustomQuiz = ({ topics, token, onBack }: Props) => {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // --- Form States ---
  const [mode, setMode] = useState<"study" | "exam">("study");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [quizName, setQuizName] = useState("");

  // --- API Mutation ---
  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/quiz/create`,
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
      if (!response.ok)
        throw new Error(result.message || "Failed to create quiz");
      return result;
    },
    onSuccess: (data) => {
      toast.success("Quiz created successfully!");
      router.push(`/custom-quizzes/study-exam-mode/${data?.data?._id}`);
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleFinish = () => {
    const payload = {
      topicIds: selectedTopics,
      quizName:
        quizName.trim() || `Quiz ${new Date().toLocaleDateString("en-GB")}`,
      mode: mode,
      questionCount: Number(questionCount),
      timeLimitMinutes: mode === "exam" ? 60 : 30,
    };
    mutation.mutate(payload);
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    );
  };

  const handleBack = () => {
    if (step === 1) {
      onBack();
    } else {
      setStep(step - 1);
    }
  };

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen">
      <div className="mb-10">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4 text-slate-600 hover:text-slate-900 -ml-2"
        >
          ← Back
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">New Custom Quiz</h1>
        <p className="text-slate-500 mt-2">
          Complete the 4 steps to create your personalized practice session.
        </p>
      </div>

      {/* Main container with max-width for large screens */}
      <div className="max-w-[500px]">
        <div className="space-y-2">
          {/* Step 1: Mode */}
          <StepWrapper
            num={1}
            title="Study mode or exam mode?"
            isActive={step === 1}
            isCompleted={step > 1}
          >
            <div className="w-full">
              <RadioGroup
                value={mode}
                onValueChange={(v: any) => setMode(v)}
                className="grid gap-4"
              >
                <Label
                  htmlFor="study"
                  className={cn(
                    "flex flex-col p-4 border rounded-lg cursor-pointer transition-all items-start",
                    mode === "study"
                      ? "border-[#6b21a8] bg-purple-50"
                      : "hover:bg-slate-50",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="study" id="study" />
                    <span className="font-bold text-slate-800">Study mode</span>
                  </div>
                  <p className="text-xs text-slate-500 ml-7 mt-1">
                    Unlimited quizzes, see answers instantly and compare to your
                    peers
                  </p>
                </Label>
                <Label
                  htmlFor="exam"
                  className={cn(
                    "flex flex-col p-4 border rounded-lg cursor-pointer transition-all items-start",
                    mode === "exam"
                      ? "border-[#6b21a8] bg-purple-50"
                      : "hover:bg-slate-50",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="exam" id="exam" />
                    <span className="font-bold text-slate-800">Exam mode</span>
                  </div>
                  <p className="text-xs text-slate-500 ml-7 mt-1">
                    Timed experience, results shown at the end
                  </p>
                </Label>
              </RadioGroup>
              <Button
                onClick={() => setStep(2)}
                className="mt-6 bg-[#6b21a8] hover:bg-[#581c87] px-8"
              >
                Continue
              </Button>
            </div>
          </StepWrapper>

          {/* Step 2: Topics */}
          <StepWrapper
            num={2}
            title="Which topics?"
            isActive={step === 2}
            isCompleted={step > 2}
          >
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {topics.map((topic) => (
                  <div
                    key={topic}
                    className="flex items-center space-x-3 p-2 rounded hover:bg-slate-50"
                  >
                    <Checkbox
                      id={topic}
                      checked={selectedTopics.includes(topic)}
                      onCheckedChange={() => toggleTopic(topic)}
                    />
                    <Label
                      htmlFor={topic}
                      className="text-sm font-medium cursor-pointer leading-tight"
                    >
                      {topic}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  disabled={selectedTopics.length === 0}
                  onClick={() => setStep(3)}
                  className="bg-[#6b21a8] hover:bg-[#581c87]"
                >
                  Next Step
                </Button>
              </div>
            </div>
          </StepWrapper>

          {/* Step 3: Question Count */}
          <StepWrapper
            num={3}
            title="How many questions?"
            isActive={step === 3}
            isCompleted={step > 3}
          >
            <div className="w-full">
              <div className="max-w-[200px] space-y-4">
                <Input
                  type="number"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  min={1}
                  max={100}
                  className="text-lg h-12"
                />
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(4)}
                    className="bg-[#6b21a8] hover:bg-[#581c87]"
                  >
                    Next Step
                  </Button>
                </div>
              </div>
            </div>
          </StepWrapper>

          {/* Step 4: Quiz Name */}
          <StepWrapper
            num={4}
            title="Name of the quiz"
            isActive={step === 4}
            isCompleted={step > 4}
          >
            <div className="w-full">
              <div className="space-y-6">
                <Input
                  placeholder={`(Optional) e.g. ${new Date().toLocaleDateString("en-GB")} Quiz`}
                  value={quizName}
                  onChange={(e) => setQuizName(e.target.value)}
                  className="h-12"
                />
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(3)}>
                    Back
                  </Button>
                  <Button
                    onClick={handleFinish}
                    disabled={mutation.isPending}
                    className="bg-[#6b21a8] hover:bg-[#581c87] px-10"
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      "Confirm & Create"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </StepWrapper>
        </div>
      </div>
    </div>
  );
};

export default CreateCustomQuiz;
