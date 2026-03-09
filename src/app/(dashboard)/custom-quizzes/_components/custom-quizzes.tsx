import React from "react";
import { LayoutGrid, Clock, CheckCircle2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const CustomQuizzes = () => {
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-900">Custom Quizzes</h1>

      <div className="flex flex-col lg:flex-row items-stretch gap-6 mt-6">
        {/* Practice Exam Card with Dialog */}
        <div className="border px-5 py-6 rounded-lg bg-white flex items-center justify-between lg:w-1/2 shadow-sm">
          <p className="text-slate-600 lg:max-w-md">
            You can test your knowledge with a timed practice exam using
            randomized questions.
          </p>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#0e308d] hover:bg-[#0a246b] hover:cursor-pointer">
                New Practice Exam
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] p-8">
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
                  <p className="font-medium text-slate-700">
                    Your Practice exam will include:
                  </p>

                  <div className="flex gap-4">
                    <LayoutGrid className="w-6 h-6 mt-1 text-slate-800 shrink-0" />
                    <p className="text-slate-600">
                      60 randomized questions from across 1 subspecialties based
                      on ABIM exam blueprint.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Clock className="w-6 h-6 mt-1 text-slate-800 shrink-0" />
                    <p className="text-slate-600">
                      2 hour time limit with the ability to pause the timer,
                      unlike the ABIM exam.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 mt-1 text-slate-800 shrink-0" />
                    <p className="text-slate-600">
                      Correct answers will count toward your CME/MOC progress
                      and overall completion of MSK Nexus.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <BookOpen className="w-6 h-6 mt-1 text-slate-800 shrink-0" />
                    <p className="text-slate-600">
                      After the practice exam, evaluate your results, study
                      relevant questions and read related text.
                    </p>
                  </div>
                </div>

                <p className="font-semibold text-slate-800">Good Luck!</p>
              </div>

              <DialogFooter className="flex sm:justify-center gap-4 mt-4">
                <Button
                  variant="outline"
                  className="px-10 border-[#0e308d] text-[#0e308d] hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button className="px-10 bg-[#0e308d] hover:bg-[#0a246b]">
                  Start
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Create New Quiz Card */}
        <div className="border px-5 py-6 rounded-lg bg-white flex items-center justify-between lg:w-1/2 shadow-sm">
          <p className="text-slate-600 lg:max-w-md">
            You can test your knowledge with a timed practice exam using
            randomized questions.
          </p>
          <Button className="bg-[#0e308d] hover:bg-[#0a246b] hover:cursor-pointer">
            Create New Quiz
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomQuizzes;
