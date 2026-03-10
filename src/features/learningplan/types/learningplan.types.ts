// ── Topic (Injury) ──
export interface Topic {
  _id: string;
  Id: string;
  Name: string;
  Primary_Body_Region: string;
  Secondary_Body_Region?: string;
  Image_URL?: string;
  Description?: string;
}

// ── Populated Flashcard ──
export interface PopulatedFlashcard {
  _id: string;
  flashcardId: {
    _id: string;
    question?: string;
    answer?: string;
    topicId: Topic;
    [key: string]: unknown;
  };
  isAnswered:
    | "unanswered"
    | "answered"
    | "skipped"
    | "correct"
    | "incorrect"
    | "unsure";
  answeredAt?: string | null;
}

// ── Populated Article ──
export interface PopulatedArticle {
  _id: string;
  articleId: {
    _id: string;
    name?: string;
    topicIds: Topic[];
    [key: string]: unknown;
  };
  isRead: "unread" | "read" | "skipped";
  readAt?: string | null;
}

// ── Learning Plan ──
export interface LearningPlan {
  _id: string;
  userId: string;
  name?: string;
  description?: string;
  flashcards: PopulatedFlashcard[];
  articles: PopulatedArticle[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── API Responses ──
export interface LearningPlanMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface GetAllLearningPlansResponse {
  statusCode: number;
  message: string;
  status: string;
  data: LearningPlan[];
  meta: LearningPlanMeta;
}

// ── Derived UI Types ──
export interface BodyRegionGroup {
  region: string;
  imageUrl: string;
  topics: Topic[];
  chapterCount: number;
}

export interface ProgressInfo {
  done: number;
  total: number;
  percentage: number;
}

export interface TopicProgress {
  topic: Topic;
  flashcards: ProgressInfo;
  articles: ProgressInfo;
  mcqs: ProgressInfo;
}
