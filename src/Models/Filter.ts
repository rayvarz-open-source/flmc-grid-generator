import { FieldSchemaTypeSource } from "./Field";

export enum FilterSchemaType {
  LIKE = "like",
  EQUAL_BY = "equalBy",
  AND = "AND",
  OR = "OR",
  NOT_EQUAL_BY = "notEqualBy",
  NOT_LIKE = "notLike",
  LESS_THAN = "lessThan",
  LESS_THAN_OR_EQUAL = "lessThanOrEqual",
  GREATER_THAN = "greaterThan",
  GREATER_THAN_OR_EQUAL = "greaterThanOrEqual",
}

export function getFilterSchemaTypeName(type: FilterSchemaType) {
  switch(type) {
    case FilterSchemaType.AND: return "And";
    case FilterSchemaType.OR: return "Or";
    case FilterSchemaType.EQUAL_BY: return "Equal to";
    case FilterSchemaType.LIKE: return "Similar to";
    case FilterSchemaType.NOT_EQUAL_BY: return "Not equal to";
    case FilterSchemaType.NOT_LIKE: return "Not similar to";
    case FilterSchemaType.LESS_THAN: return "Less than";
    case FilterSchemaType.LESS_THAN_OR_EQUAL: return "Less than or equal to";
    case FilterSchemaType.GREATER_THAN: return "Greater than";
    case FilterSchemaType.GREATER_THAN_OR_EQUAL: return "Greater than or equal to";
    default: return "";
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

export type Filter<ResultModel = null> = ResultModel extends null
  ? {
      fieldName: string;
      type: FilterSchemaType;
      value: any;
    }
  : {
      [K in keyof ResultModel]: {
        fieldName: K;
        type: FilterSchemaType;
        value: ResultModel[K];
      };
    }[keyof ResultModel];

export function funcFilter(name: string): any {
  return name;
}
