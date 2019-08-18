import { AttributeObservables, BaseProps, ElementInstances } from "../BaseGridGenerator";
import { columnDefinitionHandler } from "./ColumnDefinitionHandler/ColumnDefinitionHandler";
import { commandHandler } from "./CommandHandler/CommandHandler";
import { customRowRendererHandler } from "./CustomRowRenderHandler/CustomRowRendererHandler";
import { localDataSourceHandler } from "./DataSourceHandler/LocalDataSourceHandler";
import { remoteDataSourceHandler } from "./DataSourceHandler/RemoteDataSourceHandler";
import { exportHandler } from "./ExportHandler/ExportHandler";
import { filterHandler } from "./FilterHandler/FilterHandler";
import { refreshActionHandler } from "./RefreshActionHandler/RefreshActionHandler";
import { selectionHandler } from "./SelectionHandler/SelectionHandler";
import { sortHandler } from "./SortHandler/SortHandler";

export type Handler = (
  props: BaseProps<any> & ElementInstances,
  observables: AttributeObservables
) => AttributeObservables;

export const handlers: Handler[] = [
  commandHandler, //
  localDataSourceHandler,
  remoteDataSourceHandler,
  columnDefinitionHandler,
  selectionHandler,
  customRowRendererHandler,
  filterHandler,
  sortHandler,
  exportHandler,
  refreshActionHandler
];
