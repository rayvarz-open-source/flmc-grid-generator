import { ColumnDefinitions } from "flmc-lite-renderer/build/form/elements/grid/GridElementAttributes";
import { Action } from "material-table";
import { BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import { GridGenerator } from "../../GridGenerator";
import { FieldSchema, FieldShemaTypeName } from "../../Models/Field";
import { KeyValueModel } from "../../Models/KeyValueModel";
import { Localization } from "../../Models/Localization";
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

  let localizationSnapshot: Localization;
  props.options.localization.subscribe(v => (localizationSnapshot = v));

  const colDefinitionHandler = observables.columnDefinitions.pipe(
    map(([cols, schema]): [ColumnDefinitions, Schema] => {
      const newCols = cols.map(col => {
        const field: FieldSchema = col.fieldDefinition;

        const filters = schema.filters.filter(filter => filter.fieldName === field.fieldName);
        let defaultFilter = filters.find(v => v.isDefault && v.fieldName === field.fieldName);
        let canFilter = filters.length > 0 && defaultFilter != null;
        if (field.type.name === FieldShemaTypeName.List && props.options.listFilterDataSource == null)
          canFilter = false;
        return {
          ...col,
          field: field.fieldName,
          filter: defaultFilter,
          dataSource: props.options.listFilterDataSource,
          filterPlaceholder: filters.length > 0 ? filters[0].fieldName : " ",
          filtering: canFilter,
          showListFilterModal: (onSelect: (model: KeyValueModel) => void) => {
            if (props.options.listFilterDataSource == null) return;
            const source = defaultFilter!.source || field.type.source!;

            props.elements.listFilterModal.child(
              GridGenerator({
                dataSource: options => {
                  return props.options.listFilterDataSource!({
                    ...options,
                    url: source.address!,
                    filters: [...(options.filters || []), ...(source.request.filters || [])],
                    sorts: [...(options.sorts || []), ...(source.request.sorts || [])]
                  });
                },
                options: {
                  listFilterDataSource: props.options.listFilterDataSource,
                  localization: props.options.localization
                },
                controllers: {
                  customActionsController: new BehaviorSubject<Action<any>[]>([
                    {
                      icon: "check",
                      isFreeAction: false,
                      tooltip: localizationSnapshot!.select,
                      onClick: (event: any, model: any) => {
                        onSelect({ key: model[source.keyFieldName], value: model[source.valueFieldName] });
                        props.elements.listFilterModal.openContainer.next(false);
                      }
                    }
                  ])
                }
              })
            );

            //
            props.elements.listFilterModal.openContainer.next(true);
          }
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
