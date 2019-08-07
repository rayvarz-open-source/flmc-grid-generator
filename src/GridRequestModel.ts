import { FilterSchemaType } from "./GridResultModel";

export type Sorts = {
  fieldName: string;
  type: string;
}[];

export type Filter = {
  fieldName: string;
  type: FilterSchemaType;
  value: any;
};
