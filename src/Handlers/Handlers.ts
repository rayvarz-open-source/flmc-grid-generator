import { AttributeObservables, BaseProps, ElementInstances } from "./BaseGridGenerator";
import { commandHandler } from "./CommandHandler/CommandHandler";
import { customRowRendererHandler } from "./CustomRowRenderHandler/CustomRowRendererHandler";
import { localDataSourceHandler } from "./DataSourceHandler/LocalDataSourceHandler";
import { remoteDataSourceHandler } from "./DataSourceHandler/RemoteDataSourceHandler";
import { filterHandler } from "./FilterHandler/FilterHandler";
import { selectionHandler } from "./SelectionHandler/SelectionHandler";

export type Handler = (
  props: BaseProps<any> & ElementInstances,
  observables: AttributeObservables
) => AttributeObservables;

export const handlers: Handler[] = [
  commandHandler, //
  localDataSourceHandler,
  remoteDataSourceHandler,
  selectionHandler,
  customRowRendererHandler,
  filterHandler
];
