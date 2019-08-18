import { ColumnDefinitions } from "flmc-lite-renderer/build/form/elements/grid/GridElementAttributes";
import { map } from "rxjs/operators";
import { Schema } from "../../Models/Schema";
import { Handler } from "../Handlers";
import CustomFilterRowView from "./FilterRowView";
export const filterHandler: Handler = (props, observables) => {
  const componentOverride = observables.componentsOverride.pipe(
    map(v => {
      return {
        ...v,
        FilterRow: CustomFilterRowView
      };
    })
  );

  const colDefinitionHandler = observables.columnDefinitions.pipe(
    map(([cols, schema]): [ColumnDefinitions, Schema] => {
      const newCols = cols.map(col => {
        const field = schema.fields.find(v => v.fieldName === col.field)!;

        const filters = schema.filters.filter(filter => filter.fieldName === field.fieldName);
        let defaultFilter: any = filters.filter(v => v.isDefault);
        defaultFilter = defaultFilter.length > 0 ? defaultFilter[0] : undefined;

        return {
          ...col,
          field: field.fieldName,
          filter: defaultFilter,
          filterPlaceholder: filters.length > 0 ? filters[0].fieldName : " ",
          filtering: filters.length > 0
        };
      });
      return [newCols, schema];
    })
  );

  return {
    ...observables,
    componentsOverride: componentOverride,
    columnDefinitions: colDefinitionHandler
  };
};
