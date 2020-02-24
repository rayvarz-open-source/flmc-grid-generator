export interface FieldSchemaTypeSource {
  address: string | null;
  keyFieldName: string;
  valueFieldName: string;
  request: any | null;
  values: any[];
}

// WARNING! WILL REMOVE THIS TYPE IN FUTURE VERSIONS
// Typo
export type FieldShemaTypeName = FieldSchemaTypeName;

export enum FieldSchemaTypeName {
  Int = "Int",
  String = "String",
  GregorianDateTime = "GregorianDateTime",
  PersianDate = "PersianDate",
  Money = "Money",
  Bit = "Bit",
  Image = "Image",
  ImageList = "ImageList",
  Barcode = "Barcode",
  QRCode = "QR",
  Object = "Object",
  List = "List",
  LocalList = "LocalList"
}

export type FieldType = {
  name: FieldSchemaTypeName;
  source: FieldSchemaTypeSource | null;
};

export interface FieldSchema {
  fieldName: string;
  title: string;
  type: FieldType;
  isKey: boolean;
  isVisible: boolean;
  isVisibleDefault: boolean;
  order: number;
  isEditable: boolean;
}
