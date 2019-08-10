import { Filter } from "./GridRequestModel";

import { Schema, FieldShemaTypeName, FilterSchemaType } from "./GridResultModel";

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
  return filters.map(
    (filter): Filter => {
      let fieldName = filter.column.field;
      let fieldType = schema.fields.filter(field => field.fieldName == fieldName)[0].type.name;

      let value: number | string | null = null;
      if (fieldType == FieldShemaTypeName.Int && !isNaN(filter.value)) value = parseInt(filter.value);
      if (fieldType == FieldShemaTypeName.String) value = filter.value;

      return {
        fieldName: fieldName,
        type: fieldType == FieldShemaTypeName.Int ? FilterSchemaType.EQUAL_BY : FilterSchemaType.LIKE,
        value: value
      };
    }
  );
}
