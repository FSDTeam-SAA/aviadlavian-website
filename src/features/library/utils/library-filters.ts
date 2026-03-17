import { LibraryArticle } from "../type/library";

export interface LibraryFilters {
  acuity?: string;
  ageGroup?: string;
  tissueType?: string;
  importance?: string;
}

/**
 * Filter library articles based on various criteria
 */
export const filterLibraryArticles = (
  articles: LibraryArticle[],
  filters: LibraryFilters,
): LibraryArticle[] => {
  return articles.filter((article) => {
    // Check if any topic in the article matches the filters
    return article.topicIds.some((topic) => {
      const matchAcuity = !filters.acuity || topic.Acuity === filters.acuity;
      const matchAgeGroup =
        !filters.ageGroup || topic.Age_Group === filters.ageGroup;
      const matchTissueType =
        !filters.tissueType || topic.Tissue_Type?.includes(filters.tissueType);
      const matchImportance =
        !filters.importance || topic.Importance_Level === filters.importance;

      return matchAcuity && matchAgeGroup && matchTissueType && matchImportance;
    });
  });
};

/**
 * Extract unique filter options from articles
 */
export const getFilterOptions = (articles: LibraryArticle[]) => {
  const acuities = new Set<string>();
  const ageGroups = new Set<string>();
  const tissueTypes = new Set<string>();
  const importanceLevels = new Set<string>();

  articles.forEach((article) => {
    article.topicIds.forEach((topic) => {
      if (topic.Acuity) acuities.add(topic.Acuity);
      if (topic.Age_Group) ageGroups.add(topic.Age_Group);
      if (topic.Importance_Level) importanceLevels.add(topic.Importance_Level);
      topic.Tissue_Type?.forEach((tt) => tissueTypes.add(tt));
    });
  });

  return {
    acuities: Array.from(acuities).sort(),
    ageGroups: Array.from(ageGroups).sort(),
    tissueTypes: Array.from(tissueTypes).sort(),
    importanceLevels: Array.from(importanceLevels).sort(),
  };
};
