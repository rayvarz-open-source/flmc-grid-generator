import { GridElement } from "flmc-lite-renderer/build/form/elements/grid/GridElement";
import { BehaviorSubject, combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { Handler } from "../Handlers";

export function createUncheckedChangeCallBack<Model>(
  gridElement: GridElement,
  selectedItems: BehaviorSubject<Model[]>,
  currentPageData: BehaviorSubject<Model[]>,
  keyFieldName: BehaviorSubject<string>
): (model: Model, checked: boolean) => void {
  let skipUncheck = false;
  function addSelectedItem(data: Model) {
    if (!selectedItems.value.map(s => s[keyFieldName.value]).includes(data[keyFieldName.value])) {
      skipUncheck = true;
      selectedItems.next([...selectedItems.value, data]);
    }
  }

  function removeSelectedItem(data: Model) {
    skipUncheck = true;
    selectedItems.next(selectedItems.value.filter(v => v[keyFieldName.value] != data[keyFieldName.value]));
  }

  // handles select all and select none
  gridElement.onSelectedChange(data => {
    if (data.length === 0) currentPageData.value.forEach(v => removeSelectedItem(v));
    else data.forEach(v => addSelectedItem(v));
  });

  function updateDataManger(model: Model, checked: boolean) {
    let table = gridElement.tableRef!;
    table.dataManager.changeRowSelected(checked, [(model as any).tableData.id]);
    table.setState(table.dataManager.getRenderState(), () => table.onSelectionChange(model));
  }

  function updateDataManagerStateWithNewValue(value: Model[]) {
    if (skipUncheck) return;
    let table = gridElement.tableRef;
    if (table == null) return;
    table.dataManager.data
      .filter(
        v => v.tableData.checked === true && !value.map(i => i[keyFieldName.value]).includes(v[keyFieldName.value])
      )
      .forEach(item => updateDataManger(item, false));
  }

  selectedItems.subscribe({
    next: v => {
      updateDataManagerStateWithNewValue(v);
      skipUncheck = false;
    }
  });

  return function handleCheckedChanged(model: Model, checked: boolean) {
    updateDataManger(model, checked);

    if (checked) addSelectedItem(model);
    else removeSelectedItem(model);
  };
}

export const selectionHandler: Handler = (props, observables) => {
  const optionsObservable = combineLatest(observables.gridOptions, props.options.enableSelection).pipe(
    map(([options, isSelectionEnabled]) => {
      const onCheckedChanged = createUncheckedChangeCallBack(
        props.elements.grid,
        props.controllers.selectionController,
        props.controllers.currentPageDataController,
        props.controllers.keyFieldName
      );
      return {
        ...options,
        selection: isSelectionEnabled,
        showTextRowsSelected: false,
        selectionProps: rowData => {
          return {
            onChange: e => onCheckedChanged(rowData, e.target.checked)
          };
        }
      };
    })
  );

  return {
    ...observables,
    gridOptions: optionsObservable
  };
};
