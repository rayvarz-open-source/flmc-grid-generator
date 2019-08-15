import { FieldSchema } from "./Field";
import { FilterSchema } from "./Filter";
import { SortSchema } from "./Sort";

export interface Schema {
  fields: FieldSchema[];
  filters: FilterSchema[];
  sorts: SortSchema[];
}
