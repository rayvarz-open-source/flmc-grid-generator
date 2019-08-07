export interface FieldSchemaTypeSource {
  address: string;
  key: string;
  value: string;
  request: object | null;
}

export enum FieldShemaTypeName {
  Int = "Int",
  String = "String",
  List = "List",
  GregorianDateTime = "GregorianDateTime",
  PersianDate = "PersianDate",
  Money = "Money",
  Bit = "Bit",
  Image = "Image",
  ImageList = "ImageList"
}

export interface FieldSchema {
  fieldName: string;
  title: string;
  type: {
    name: FieldShemaTypeName;
    source: FieldSchemaTypeSource | null;
  };
  isKey: boolean;
  isVisible: boolean;
  order: number;
  isEditable: boolean;
}

export enum FilterSchemaType {
  LIKE = "like",
  EQUAL_BY = "equalBy"
}

export interface FilterSchema {
  fieldName: string;
  type: FilterSchemaType;
  value: null;
  source: null;
}

export enum SortSchemaType {
  All = "ALL"
}

export interface SortSchema {
  fieldName: string;
  type: SortSchemaType;
}

export interface Schema {
  fields: FieldSchema[];
  filters: FilterSchema[];
  sorts: SortSchema[];
}

export interface PaginationInfo {
  totalPage: number;
}

export interface GridResultModel<Model> {
  value: Model[];
  needSchema: boolean;
  schema: Schema;
  pagination: PaginationInfo;
  result: boolean;
  message: string;
}
