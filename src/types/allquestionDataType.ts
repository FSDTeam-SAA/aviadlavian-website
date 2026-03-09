type Injury = {
  _id: string;
  Id: string;
  Name: string;
  Image_URL: string;
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
  Video_URL: string;
  Tags_Keywords: string[];
  __v: number;
  createdAt: string;
  updatedAt: string;
};

type Meta = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type InjuryResponse = {
  message: string;
  statusCode: number;
  status: string;
  meta: Meta;
  data: Injury[];
};
