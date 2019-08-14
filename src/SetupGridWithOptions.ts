import { GridElement } from "flmc-lite-renderer/build/form/elements/grid/GridElement";
import { ActionDefinitions } from "flmc-lite-renderer/build/form/elements/grid/GridElementAttributes";
import { BehaviorSubject } from "rxjs";
import { Options } from "./Options";
import { HideColumnsController } from "./SetupHideColumnModal";

export function setupGridWithOptions<Model>(
  gridElement: GridElement,
  options: Options<Model>,
  refreshEvent: BehaviorSubject<null>,
  onCheckedChange?: (rowData: Model, checked: boolean) => void,
  hideColumnsController?: HideColumnsController
) {
  gridElement.localizationDefinition(options.localization.materialTable);

  gridElement.gridOptions({
    actionsColumnIndex: -1,
    filtering: true,
    padding: "dense",
    pageSize: 5,
    initialPage: 0,
    pageSizeOptions: [5, 10, 20, 25, 50],
    debounceInterval: 0.7,
    loadingType: "linear",
    selection: options.selection != null,
    showTextRowsSelected: false,
    exportButton: options.export || true,
    selectionProps:
      onCheckedChange == null
        ? undefined
        : rowData => {
            return {
              onChange: e => {
                onCheckedChange(rowData, e.target.checked);
              }
            };
          }
  });

  gridElement.refreshEvent(refreshEvent);

  let actionDefinitions: ActionDefinitions = [];

  actionDefinitions.push({
    icon: "refresh",
    isFreeAction: true,
    tooltip: options.localization.refresh,
    onClick: (event: any, data: Model) => refreshEvent.next(null)
  });

  if (options.onCreate != null) {
    actionDefinitions.push({
      icon: "add_box",
      isFreeAction: true,
      tooltip: options.localization.create,
      onClick: (event: any, data: Model) => options.onCreate!()
    });
  }

  if (options.onEdit != null) {
    actionDefinitions.push({
      icon: "edit_box",
      isFreeAction: false,
      tooltip: options.localization.edit,
      onClick: (event: any, data: Model) => options.onEdit!(data)
    });
  }

  if (options.onSelect != null) {
    actionDefinitions.push({
      icon: "check",
      isFreeAction: false,
      tooltip: options.localization.select,
      onClick: (event: any, data: Model) => options.onSelect!(data)
    });
  }

  if (options.onDelete != null) {
    actionDefinitions.push({
      icon: "delete_box",
      isFreeAction: false,
      tooltip: options.localization.delete,
      onClick: async (event: any, data: Model) => {
        if (await options.onDelete!(data as Model)) {
          // TODO: refresh
        }
      }
    });
  }

  if (hideColumnsController != null && (options.hideColumnModal || true)) {
    actionDefinitions.push({
      icon: "visibility",
      isFreeAction: true,
      tooltip: options.localization.columnVisibility,
      onClick: async (event: any, data: Model) => hideColumnsController.open.next(true)
    });
  }

  gridElement.actionDefinitions(actionDefinitions);
}
