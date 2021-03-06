import { AttributeObservables, BaseProps, ElementInstances } from "../BaseGridGenerator";
import { advanceFilterHandler } from "./AdvanceFilterHandler/AdvanceFilterHandler";
import { columnDefinitionHandler } from "./ColumnDefinitionHandler/ColumnDefinitionHandler";
import { commandHandler } from "./CommandHandler/CommandHandler";
import { customActionHandler } from "./CustomActionHandler/CustomActionHandler";
import { customRowRendererHandler } from "./CustomRowRenderHandler/CustomRowRendererHandler";
import { localDataSourceHandler } from "./DataSourceHandler/LocalDataSourceHandler";
import { remoteDataSourceHandler } from "./DataSourceHandler/RemoteDataSourceHandler";
import { exportHandler } from "./ExportHandler/ExportHandler";
import { filterHandler } from "./FilterHandler/FilterHandler";
import { hideColumnsModalHandler } from "./HideColumnsModalHandler/HideColumnsModalHandler";
import { inlineEditHandler } from "./InlineEditHandler/InlineEditHandler";
import { refreshActionHandler } from "./RefreshActionHandler/RefreshActionHandler";
import { selectionHandler } from "./SelectionHandler/SelectionHandler";
import { sortHandler } from "./SortHandler/SortHandler";
import { tableLocalizationHandler } from "./TableLocalizationHandler/TableLocalizationHandler";

export type Handler = (
  props: BaseProps<any> & ElementInstances,
  observables: AttributeObservables
) => AttributeObservables;

export const handlers: Handler[] = [
  commandHandler,
  tableLocalizationHandler,
  columnDefinitionHandler,
  localDataSourceHandler,
  remoteDataSourceHandler,
  selectionHandler,
  customRowRendererHandler,
  filterHandler,
  advanceFilterHandler,
  sortHandler,
  exportHandler,
  refreshActionHandler,
  hideColumnsModalHandler,
  customActionHandler,
  inlineEditHandler
];
