export enum SortSchemaType {
  All = "ALL"
}

export interface SortSchema {
  fieldName: string;
  type: SortSchemaType;
}

export type Sort = {
  fieldName: string;
  type: string;
};
