import {
  LearningPlan,
  Topic,
  BodyRegionGroup,
  TopicProgress,
  ProgressInfo,
  PopulatedFlashcard,
  PopulatedArticle,
  PopulatedQuiz,
} from "../types/learningplan.types";

// ── Calculate progress helper ──
export function calculateProgress(done: number, total: number): ProgressInfo {
  return {
    done,
    total,
    percentage: total > 0 ? Math.round((done / total) * 100) : 0,
  };
}

// ── Extract all unique topics from learning plans ──
export function extractTopics(plans: LearningPlan[]): Topic[] {
  const topicMap = new Map<string, Topic>();

  for (const plan of plans) {
    // From flashcards
    for (const fc of plan.flashcards) {
      const topic = fc.flashcardId?.topicId;
      if (topic?._id) {
        topicMap.set(topic._id, topic);
      }
    }

    // From articles
    for (const art of plan.articles) {
      const topicIds = art.articleId?.topicIds;
      if (Array.isArray(topicIds)) {
        for (const topic of topicIds) {
          if (topic?._id) {
            topicMap.set(topic._id, topic);
          }
        }
      }
    }

    // From quizzes
    for (const q of plan.quizzes || []) {
      const topicId = q.quizId?.topicId;
      const topicIds = q.quizId?.topicIds;

      if (topicId && typeof topicId === "object" && (topicId as Topic)._id) {
        topicMap.set((topicId as Topic)._id, topicId as Topic);
      }

      if (Array.isArray(topicIds)) {
        for (const topic of topicIds) {
          if (topic?._id) {
            topicMap.set(topic._id, topic);
          }
        }
      }
    }
  }

  return Array.from(topicMap.values());
}

// ── Group topics by Primary_Body_Region ──
export function groupByBodyRegion(plans: LearningPlan[]): BodyRegionGroup[] {
  const topics = extractTopics(plans);
  const regionMap = new Map<string, Topic[]>();

  for (const topic of topics) {
    const region = topic.Primary_Body_Region;
    if (!region) continue;

    if (!regionMap.has(region)) {
      regionMap.set(region, []);
    }
    regionMap.get(region)!.push(topic);
  }

  return Array.from(regionMap.entries()).map(([region, regionTopics]) => ({
    region,
    imageUrl: regionTopics[0]?.Image_URL || "https://placehold.co/48x48",
    topics: regionTopics,
    chapterCount: regionTopics.length,
  }));
}

// ── Get per-topic progress for a given body region ──
export function getTopicProgress(
  plans: LearningPlan[],
  bodyRegion: string,
): TopicProgress[] {
  const topics = extractTopics(plans);
  const regionTopics = topics.filter(
    (t) => t.Primary_Body_Region.toLowerCase() === bodyRegion.toLowerCase(),
  );

  return regionTopics.map((topic) => {
    // Flashcard progress for this topic
    let fcAnswered = 0;
    let fcTotal = 0;
    for (const plan of plans) {
      for (const fc of plan.flashcards) {
        if (fc.flashcardId?.topicId?._id === topic._id) {
          fcTotal++;
          if (
            fc.isAnswered === "answered" ||
            fc.isAnswered === "correct" ||
            fc.isAnswered === "incorrect"
          )
            fcAnswered++;
        }
      }
    }

    // Article progress for this topic
    let artRead = 0;
    let artTotal = 0;
    for (const plan of plans) {
      for (const art of plan.articles) {
        const topicIds = art.articleId?.topicIds;
        if (
          Array.isArray(topicIds) &&
          topicIds.some((t) => t._id === topic._id)
        ) {
          artTotal++;
          if (art.isRead === "read") artRead++;
        }
      }
    }

    // MCQ progress for this topic
    let mcqAnswered = 0;
    let mcqTotal = 0;
    for (const plan of plans) {
      for (const q of plan.quizzes || []) {
        const quizTopicId = q.quizId?.topicId;
        const quizTopicIds = q.quizId?.topicIds;

        // Check if topic matches by ID, singular topicId, or in topicIds array
        const isMatch =
          (typeof quizTopicId === "string" &&
            (quizTopicId === topic._id ||
              quizTopicId === topic.Primary_Body_Region)) ||
          (quizTopicId &&
            typeof quizTopicId === "object" &&
            (quizTopicId as Topic)._id === topic._id) ||
          (Array.isArray(quizTopicIds) &&
            quizTopicIds.some((t) => t._id === topic._id));

        if (isMatch) {
          mcqTotal++;
          if (
            (q.quizId.totalAttempts || 0) > 0 ||
            q.isAnswered !== "unanswered"
          )
            mcqAnswered++;
        }
      }
    }

    return {
      topic,
      flashcards: calculateProgress(fcAnswered, fcTotal),
      articles: calculateProgress(artRead, artTotal),
      mcqs: calculateProgress(mcqAnswered, mcqTotal),
    };
  });
}

// ── Find a specific body region group ──
export function findBodyRegion(
  plans: LearningPlan[],
  bodyRegion: string,
): BodyRegionGroup | undefined {
  const groups = groupByBodyRegion(plans);
  return groups.find(
    (g) => g.region.toLowerCase() === bodyRegion.toLowerCase(),
  );
}

// ── Get flashcards for a specific topic ──
export function getTopicFlashcards(
  plans: LearningPlan[],
  topicId: string,
): PopulatedFlashcard[] {
  const flashcards: PopulatedFlashcard[] = [];
  for (const plan of plans) {
    for (const fc of plan.flashcards) {
      if (fc.flashcardId?.topicId?._id === topicId) {
        flashcards.push({ ...fc, planId: plan._id });
      }
    }
  }
  return flashcards;
}

// ── Get articles for a specific body region and group by secondary region ──
export function groupArticlesBySecondaryRegion(
  plans: LearningPlan[],
  bodyRegion: string,
) {
  const grouped: Record<string, PopulatedArticle[]> = {};

  for (const plan of plans) {
    for (const art of plan.articles) {
      const topicIds = art.articleId?.topicIds;
      if (!Array.isArray(topicIds)) continue;

      // Filter: Does this article belong to the current Primary_Body_Region?
      const matchingTopic = topicIds.find(
        (t) =>
          t.Primary_Body_Region?.toLowerCase() === bodyRegion.toLowerCase(),
      );

      if (matchingTopic) {
        // Group by Secondary_Body_Region (fallback to "General" if null/empty)
        const secondaryRegion =
          matchingTopic.Secondary_Body_Region || "General";

        if (!grouped[secondaryRegion]) {
          grouped[secondaryRegion] = [];
        }

        // Avoid pushing exact duplicate articles
        if (!grouped[secondaryRegion].some((a) => a._id === art._id)) {
          grouped[secondaryRegion].push({ ...art, planId: plan._id });
        }
      }
    }
  }

  return grouped;
}

// ── Get quizzes for a specific topic ──
export function getTopicQuizzes(plans: LearningPlan[], topicId: string) {
  const quizzes: PopulatedQuiz[] = [];
  const topics = extractTopics(plans);
  const targetTopic = topics.find((t) => t._id === topicId);

  for (const plan of plans) {
    for (const q of plan.quizzes || []) {
      const quizTopicId = q.quizId?.topicId;
      const quizTopicIds = q.quizId?.topicIds;

      const isMatch =
        (typeof quizTopicId === "string" &&
          (quizTopicId === topicId ||
            (targetTopic &&
              quizTopicId === targetTopic.Primary_Body_Region))) ||
        (quizTopicId &&
          typeof quizTopicId === "object" &&
          (quizTopicId as Topic)._id === topicId) ||
        (Array.isArray(quizTopicIds) &&
          quizTopicIds.some((t) => t._id === topicId));

      if (isMatch) {
        quizzes.push({ ...q, planId: plan._id });
      }
    }
  }
  return quizzes;
}

export function getTopicArticles(plans: LearningPlan[], topicId: string) {
  const articles: PopulatedArticle[] = [];
  for (const plan of plans) {
    for (const art of plan.articles) {
      if (art.articleId?.topicIds?.some((t) => t._id === topicId)) {
        articles.push({ ...art, planId: plan._id });
      }
    }
  }
  return articles;
}
