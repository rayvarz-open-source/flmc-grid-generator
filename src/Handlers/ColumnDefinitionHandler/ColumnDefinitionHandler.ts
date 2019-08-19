import { ColumnDefinitions } from "flmc-lite-renderer/build/form/elements/grid/GridElementAttributes";
import { combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { Schema } from "../../Models/Schema";
import { Handler } from "../Handlers";

export const columnDefinitionHandler: Handler = (props, observables) => {
  const colDefinitionHandler = combineLatest(
    props.controllers.hideColumnModalHiddenFieldsController,
    observables.columnDefinitions
  ).pipe(
    map(([hiddenFields, [_, schema]]): [ColumnDefinitions, Schema] => {
      const cols = schema.fields
        .filter(field => field.isVisible && field.type != null && !hiddenFields.includes(field.fieldName))
        .sort((current, next) => next.order - current.order)
        .reverse()
        .map(field => {
          return {
            title: field.title,
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
