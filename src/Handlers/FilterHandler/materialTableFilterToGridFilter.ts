import { FieldShemaTypeName } from "../Models/Field";
import { Filter, FilterSchemaType } from "../Models/Filter";
import { Schema } from "../Models/Schema";

export function isFilterChanged(oldFilters: Filter[], newFilters: Filter[]): boolean {
  if (oldFilters.length != newFilters.length) return true;
  for (let filter of newFilters) {
    if (
      oldFilters.filter(v => v.fieldName === filter.fieldName && v.type === filter.type && v.value === filter.value)
        .length === 0
    )
      return true;
  }
  return false;
}

export function materialTableFilterToGridFilter(filters: any[], schema: Schema): Filter[] {
  return filters
    .filter(v => v.value != null)
    .map(
      (filter): Filter => {
        let fieldName = filter.column.field;
        let fieldType = schema.fields.filter(field => field.fieldName == fieldName)[0].type.name;
        let value: number | string | null | boolean = null;
        if (fieldType == FieldShemaTypeName.Int && !isNaN(filter.value)) value = parseInt(filter.value);
        else if (fieldType == FieldShemaTypeName.Bit) value = filter.value === "checked";
        else value = filter.value;
        return {
          fieldName: fieldName,
          type: fieldType == FieldShemaTypeName.String ? FilterSchemaType.LIKE : FilterSchemaType.EQUAL_BY,
          value: value
        };
      }
    );
}
