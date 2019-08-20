export interface FieldSchemaTypeSource {
  address: string | null;
  keyFieldName: string;
  valueFieldName: string;
  request: any | null;
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
  QRCode = "QR",
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
  isVisibleDefault: boolean;
  order: number;
  isEditable: boolean;
}
