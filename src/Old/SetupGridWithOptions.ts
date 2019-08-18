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
    loadingType: "linear"
  });

  gridElement.refreshEvent(refreshEvent);

  let actionDefinitions: ActionDefinitions = [];

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
