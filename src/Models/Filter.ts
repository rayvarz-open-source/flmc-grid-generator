import { FieldSchemaTypeSource } from "./Field";

export enum FilterSchemaType {
  LIKE = "like",
  EQUAL_BY = "equalBy",
  AND = "and",
  OR = "or"
}

export function getFilterSchemaTypeName(type: FilterSchemaType) {
  switch(type) {
    case FilterSchemaType.AND: return "And";
    case FilterSchemaType.OR: return "Or";
    case FilterSchemaType.EQUAL_BY: return "Equals to";
    case FilterSchemaType.LIKE: return "Similar To";
  }
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
