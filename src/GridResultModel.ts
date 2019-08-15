export interface FieldSchemaTypeSource {
  address: string | null;
  keyFieldName: string;
  valueFieldName: string;
  request: object | null;
  values: any[];
}

export enum FieldShemaTypeName {
  Int = "Int",
  String = "String",
  GregorianDateTime = "GregorianDateTime",
  PersianDate = "PersianDate",
  Money = "Money",
  Bit = "Bit",
  Image = "Image",
  ImageList = "ImageList",
  Barcode = "Barcode",
  List = "List",
  LocalList = "LocalList"
}

export type FieldType = {
  name: FieldShemaTypeName;
  source: FieldSchemaTypeSource | null;
};

export interface FieldSchema {
  fieldName: string;
  title: string;
  type: FieldType;
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
  filterName: string;
  isDefault: boolean;
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
  totalRow: number;
}

export interface GridResultModel<Model> {
  value: Model[];
  needSchema: boolean;
  schema: Schema;
  pagination: PaginationInfo;
  result: boolean;
  message: string;
}
