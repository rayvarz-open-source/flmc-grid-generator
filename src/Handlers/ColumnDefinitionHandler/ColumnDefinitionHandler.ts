import { ColumnDefinitions } from "flmc-lite-renderer/build/form/elements/grid/GridElementAttributes";
import { map } from "rxjs/operators";
import { Schema } from "../../Models/Schema";
import { Handler } from "../Handlers";

export const columnDefinitionHandler: Handler = (props, observables) => {
  const colDefinitionHandler = observables.columnDefinitions.pipe(
    map(([_, schema]): [ColumnDefinitions, Schema] => {
      const cols = schema.fields
        .filter(field => field.isVisible && field.type != null)
        .sort((current, next) => next.order - current.order)
        .reverse()
        .map(field => {
          return {
            title: field.title,
            editable: field.isEditable ? "always" : "never",
            fieldDefinition: field,
            field: field.fieldName
          };
        });
      return [cols, schema];
    })
  );

  return {
    ...observables,
    columnDefinitions: colDefinitionHandler
  };
};
