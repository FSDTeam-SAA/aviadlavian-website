type Option = {
  _id: string;
  text: string;
  isCorrect: boolean;
  selectedCount: number;
};

type Question = {
  _id: string;
  serialNumber: number;
  articleId: string;
  topicId: string;
  questionText: string;
  options: Option[];
  explanation: string;
  marks: number;
  totalAttempts: number;
  correctAttempts: number;
  isHidden: boolean;
  isDeleted: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

type Meta = {
  total: number;
};

export type QuestionsResponse = {
  message: string;
  statusCode: number;
  status: string;
  meta: Meta;
  data: Question[];
};
