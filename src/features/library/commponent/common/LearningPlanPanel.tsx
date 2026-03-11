"use client";

import React, { useState, useMemo } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import {
  useSaveLearningPlan,
  useLearningPlans,
  useCreateLearningPlan,
} from "../../hooks/uselibrary";

type LearningPlanPanelProps = {
  libraryId: string;
  chapterId: string;
  onClose: () => void;
};

const LearningPlanPanel = ({
  libraryId,
  chapterId,
  onClose,
}: LearningPlanPanelProps) => {
  const [isAdded, setIsAdded] = useState(false);
  const saveMutation = useSaveLearningPlan();
  const { data: learningPlans, isLoading } = useLearningPlans();

  // Filter learning plans to find chapters that match this chapterId
  const relatedLearningPlans = useMemo(() => {
    if (!learningPlans || learningPlans.length === 0) return [];

    return learningPlans.flatMap((plan) =>
      plan.articles
        .filter((article) =>
          article.articleId.topicIds.some((topic) => topic._id === chapterId),
        )
        .map((article) => ({
          ...article,
          planId: plan._id,
          isRead: article.isRead === "read",
        })),
    );
  }, [learningPlans, chapterId]);
  // console.log('learning ',learningPlans[0]._id, chapterId, relatedLearningPlans)

  const createMutation = useCreateLearningPlan();

  const handleAddToLearningPlan = async () => {
    try {
      let learningPlanId = learningPlans?.[0]?._id;

      // If no learning plans exist, create one first
      if (!learningPlans || learningPlans.length === 0) {
        const createdPlan = await createMutation.mutateAsync();
        learningPlanId = createdPlan?._id;
      }

      if (!learningPlanId) return;

      // Add the current article to the learning plan
      saveMutation.mutate(
        { learningPlanId, libraryId },
        {
          onSuccess: () => {
            toast.success("Added to learning plan");
            setIsAdded(true);
            setTimeout(() => {
              onClose();
              setIsAdded(false);
            }, 1500);
          },
          onError: () => {
            toast.error("Failed to add to learning plan");
          },
        },
      );
    } catch (err) {
      toast.error("Failed to process learning plan action");
      console.error("Failed to process learning plan action:", err);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Learning Plan
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-500 hover:text-slate-700"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Loading learning plans...
          </p>
        ) : relatedLearningPlans.length > 0 ? (
          <>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Learning Plans ({relatedLearningPlans.length}):
            </p>
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
              {relatedLearningPlans.map((plan) => (
                <div
                  key={plan._id}
                  className="flex items-center gap-2 rounded border border-slate-200 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  <input
                    type="checkbox"
                    checked={plan.isRead}
                    disabled
                    className="h-4 w-4"
                  />
                  <span className="flex-1 text-slate-700 dark:text-slate-300">
                    {plan.articleId.name}
                  </span>
                  {plan.isRead && (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Read
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            If you want to revisit this chapter for revision, press the button.
          </p>
        )}

        <button
          type="button"
          onClick={handleAddToLearningPlan}
          disabled={saveMutation.isPending || isAdded}
          className="w-full cursor-pointer rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saveMutation.isPending
            ? "Adding..."
            : isAdded
              ? "Added ✓"
              : "Add to learning plan"}
        </button>
        {saveMutation.isError && (
          <p className="text-xs text-red-600 dark:text-red-400">
            Failed to add to learning plan. Try again.
          </p>
        )}
      </div>
    </div>
  );
};

export default LearningPlanPanel;
