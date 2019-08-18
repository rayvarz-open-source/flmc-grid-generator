import { ColumnDefinitions } from "flmc-lite-renderer/build/form/elements/grid/GridElementAttributes";
import { combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { FieldSchema, FieldShemaTypeName } from "../../Models/Field";
import { Schema } from "../../Models/Schema";
import { Handler } from "../Handlers";

function isExportable(field: FieldSchema) {
  return (
    field.type.name != FieldShemaTypeName.Image && field.type.name != FieldShemaTypeName.ImageList && field.isVisible
  );
}

export const exportHandler: Handler = (props, observables) => {
  const optionsObservable = combineLatest(observables.gridOptions, props.options.noExport).pipe(
    map(([options, noExport]) => {
      return {
        ...options,
        exportButton: !noExport
      };
    })
  );

  const colDefinitionHandler = observables.columnDefinitions.pipe(
    map(([cols, schema]): [ColumnDefinitions, Schema] => {
      const newCols = cols.map(col => {
        const field = schema.fields.find(v => v.fieldName === col.field)!;
        return {
          ...col,
          export: isExportable(field)
        };
      });
      return [newCols, schema];
    })
  );
  return {
    ...observables,
    columnDefinitions: colDefinitionHandler,
    gridOptions: optionsObservable
  };
};
