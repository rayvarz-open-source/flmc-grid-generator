import { OnRowClick } from "flmc-lite-renderer/build/form/elements/grid/GridElementAttributes";
import { BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import { Handler } from "../Handlers";

export const inlineEditHandler: Handler = (props, observables) => {
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

  return {
    ...observables,
    rowActionDefinitions: rowActionDefinitionObservable,
    onRowClick: onRowClick
  };
};
