export type LibraryQueryParams = {
  page?: number;
  limit?: number;
};

export type LibraryImage = {
  public_id: string;
  secure_url: string;
};

export type LibraryTopic = {
  _id: string;
  Id: string;
  Name: string;
  Primary_Body_Region: string;
  Secondary_Body_Region: string;
  Acuity: string;
  Age_Group: string;
  Tissue_Type: string[];
  Etiology_Mechanism: string;
  Common_Sports: string[];
  Synonyms_Abbreviations: string[];
  Importance_Level: string;
  Description: string;
  Image_URL: string;
  Video_URL: string;
  Tags_Keywords: string[];
  __v: number;
  createdAt: string;
  updatedAt: string;
};

export type LibraryArticle = {
  _id: string;
  name: string;
  description: string;
  topicIds: LibraryTopic[];
  image?: LibraryImage;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type LibraryMeta = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type GetAllLibraryArticlesResponse = {
  message: string;
  statusCode: number;
  status: string;
  meta: LibraryMeta;
  data: LibraryArticle[];
};
