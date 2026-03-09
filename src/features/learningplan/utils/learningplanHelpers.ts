import {
  LearningPlan,
  Topic,
  BodyRegionGroup,
  TopicProgress,
  ProgressInfo,
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
          if (fc.isAnswered === "answered") fcAnswered++;
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

    return {
      topic,
      flashcards: calculateProgress(fcAnswered, fcTotal),
      articles: calculateProgress(artRead, artTotal),
      mcqs: calculateProgress(0, 0), // MCQ API not yet available
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
