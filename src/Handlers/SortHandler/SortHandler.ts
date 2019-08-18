import { ColumnDefinitions } from "flmc-lite-renderer/build/form/elements/grid/GridElementAttributes";
import { map } from "rxjs/operators";
import { Schema } from "../../Models/Schema";
import { SortSchemaType } from "../../Models/Sort";
import { Handler } from "../Handlers";

export const sortHandler: Handler = (props, observables) => {
  const colDefinitionHandler = observables.columnDefinitions.pipe(
    map(([cols, schema]): [ColumnDefinitions, Schema] => {
      const newCols = cols.map(col => {
        const field = schema.fields.find(v => v.fieldName === col.field)!;

        let sorts = schema.sorts.filter(sort => sort.fieldName == field.fieldName && sort.type == SortSchemaType.All);

        return {
          ...col,
          sorting: sorts.length > 0
        };
      });
      return [newCols, schema];
    })
  );
  return {
    ...observables,
    columnDefinitions: colDefinitionHandler
  };
};
