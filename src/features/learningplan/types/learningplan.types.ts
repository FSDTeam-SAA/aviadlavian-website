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
  planId?: string;
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

export interface Highlight {
  id: string;
  text: string;
  range: {
    from?: number;
    to?: number;
    nodePath?: string;
  };
  color: string;
}

export interface Note {
  id: string;
  content: string;
}

export interface Annotation {
  _id: string;
  articleId: string;
  userId: string;
  highlights: Highlight[];
  notes: Note[];
  createdAt: string;
  updatedAt: string;
}

// ── Populated Article ──
export interface PopulatedArticle {
  _id: string;
  planId?: string;
  articleId: {
    _id: string;
    name?: string;
    topicIds: Topic[];
    [key: string]: unknown;
  };
  isRead: "unread" | "read" | "skipped";
  readAt?: string | null;
  annotations?: Annotation | null;
}

// ── Populated Quiz (MCQ) ──
export interface PopulatedQuiz {
  _id: string;
  planId?: string;
  quizId: {
    _id: string;
    questionText: string;
    explanation?: string;
    topicIds: Topic[];
    options: {
      text: string;
      isCorrect: boolean;
      selectedCount?: number;
      _id: string;
    }[];
    totalAttempts?: number;
    correctAttempts?: number;
    [key: string]: unknown;
  };
  isAnswered: "unanswered" | "correct" | "incorrect" | "skipped";
  answeredAt?: string | null;
}

// ── Learning Plan ──
export interface LearningPlan {
  _id: string;
  userId: string;
  name?: string;
  description?: string;
  flashcards: PopulatedFlashcard[];
  articles: PopulatedArticle[];
  quizzes: PopulatedQuiz[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── API Responses ──
export interface BaseResponse<T = unknown> {
  statusCode: number;
  message: string;
  status: string;
  data: T;
}

export interface ArticleAnnotationsResponse {
  message: string;
  statusCode: number;
  status: string;
  data: Annotation;
}

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
