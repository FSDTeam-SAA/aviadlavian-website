type TopicStats = {
  correctCount: number;
  incorrectCount: number;
  correctPercentage: number;
  incorrectPercentage: number;
};

type Topic = {
  topicId: string;
  totalQuestions: number;
  attemptedCount: number;
  completionPercentage: number;
  stats: TopicStats;
};

type QuestionBankMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

type QuestionBankResponse = {
  message: string;
  statusCode: number;
  status: string;
  data: {
    meta: QuestionBankMeta;
    data: Topic[];
  };
};
