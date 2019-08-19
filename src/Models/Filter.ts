import { FieldSchemaTypeSource } from "./Field";

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
  source: null | FieldSchemaTypeSource;
}

export type Filter = {
  fieldName: string;
  type: FilterSchemaType;
  value: any;
};
