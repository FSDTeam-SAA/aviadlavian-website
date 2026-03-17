import { LibraryArticle, LibraryTopic } from "../type/library";

/**
 * Group library topics by their Primary_Body_Region across all articles
 */
export const groupLibraryTopicsByRegion = (articles: LibraryArticle[]) => {
  const groups: Record<
    string,
    { article: LibraryArticle; topic: LibraryTopic }[]
  > = {};

  articles.forEach((article) => {
    article.topicIds?.forEach((topic) => {
      const region = topic.Primary_Body_Region || "Other";
      if (!groups[region]) {
        groups[region] = [];
      }
      groups[region].push({ article, topic });
    });
  });

  return groups;
};

/**
 * Find the region of a specific topic within a list of articles
 */
export const findTopicRegion = (
  articles: LibraryArticle[],
  topicId: string,
) => {
  for (const article of articles) {
    const topic = article.topicIds?.find((t) => t._id === topicId);
    if (topic) return topic.Primary_Body_Region || "Other";
  }
  return null;
};
