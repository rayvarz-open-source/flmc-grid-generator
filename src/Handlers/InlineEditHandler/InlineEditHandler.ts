import { ColumnDefinitions, OnRowClick } from "flmc-lite-renderer/build/form/elements/grid/GridElementAttributes";
import { BehaviorSubject, combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { FieldSchema, FieldShemaTypeName } from "../../Models/Field";
import { Filter } from "../../Models/Filter";
import { Schema } from "../../Models/Schema";
import { Handler } from "../Handlers";
import InlineEditRowView from "./InlineEditRowView";

export const inlineEditHandler: Handler = (props, observables) => {
  if (props.options.inlineEditCallBack == null) return observables;
  const rowActionDefinitionObservable = observables.rowActionDefinitions.pipe(
    map(v => {
      return {
        ...v,
        isEditable: (data: any) => props.options.inlineEditCallBack != null,
        onRowUpdate:
          props.options.inlineEditCallBack == null
            ? undefined
            : async (oldData: any, newData: any) => {
                await props.options.inlineEditCallBack!(oldData, newData);
                return;
              }
      };
    })
  );

  const onRowClick = new BehaviorSubject<OnRowClick>((event, data, hd) => {
    if (props.elements.grid.tableRef == null) return;
    props.elements.grid.tableRef!.dataManager.changeRowEditing(data, "update");
    props.elements.grid.tableRef!.setState({
      ...props.elements.grid.tableRef!.dataManager.getRenderState(),
      showAddRow: false
    });
  });

  const componentOverride = observables.componentsOverride.pipe(
    map(v => {
      return {
        ...v,
        EditRow: InlineEditRowView
      };
    })
  );

  const colDefinitionHandler = combineLatest(
    props.controllers.hideColumnModalHiddenFieldsController,
    observables.columnDefinitions
  ).pipe(
    map(([hiddenFields, [cols, schema]]): [ColumnDefinitions, Schema] => {
      const newCols = cols.map(col => {
        const field: FieldSchema = col.fieldDefinition;
        let isEditable = field.isEditable ? "always" : "never";
        if (
          ![
            FieldShemaTypeName.List,
            FieldShemaTypeName.LocalList,
            FieldShemaTypeName.Bit,
            FieldShemaTypeName.String,
            FieldShemaTypeName.Int,
            FieldShemaTypeName.Money
          ].includes(field.type.name)
        )
          isEditable = "never";
        return {
          ...col,
          editable: isEditable
        };
      });
      return [newCols, schema];
    })
  );

  return {
    ...observables,
    rowActionDefinitions: rowActionDefinitionObservable,
    onRowClick: onRowClick,
    componentsOverride: componentOverride,
    columnDefinitions: colDefinitionHandler
  };
};

function processSourceFilters(filters: Filter[], row: any): Filter[] {
  let newFilter = [...filters];
  for (let filter of newFilter) {
    if (typeof filter.value === "string" && filter.value.startsWith("@")) filter.value = row[filter.value.substring(1)];
  }
  return newFilter;
}
