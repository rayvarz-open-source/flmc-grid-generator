import { PaginationInfo } from "./Pagination";
import { Schema } from "./Schema";

export interface GridResultModel<Model> {
  value: Model[];
  needSchema: boolean;
  schema: Schema;
  pagination: PaginationInfo;
  result: boolean;
  message: string;
}
