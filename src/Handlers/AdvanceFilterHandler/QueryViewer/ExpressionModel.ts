import { FieldSchema } from "../../../Models/Field";
import { Filter, FilterSchema } from "../../../Models/Filter";

export interface ExpressionModel extends Filter {
  path: number[];
  extras: {
    field: FieldSchema,
    filters: FilterSchema[]
  }
}
