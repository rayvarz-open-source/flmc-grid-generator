export enum FilterSchemaType {
  LIKE = "like",
  EQUAL_BY = "equalBy"
}

export interface FilterSchema {
  filterName: string;
  isDefault: boolean;
  fieldName: string;
  type: FilterSchemaType;
  value: null;
  source: null;
}

export type Filter = {
  fieldName: string;
  type: FilterSchemaType;
  value: any;
};
