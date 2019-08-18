import { AttributeObservables, BaseProps, ElementInstances } from "./BaseGridGenerator";
import { commandHandler } from "./CommandHandler/CommandHandler";
import { localDataSourceHandler } from "./DataSourceHandler/LocalDataSourceHandler";
import { remoteDataSourceHandler } from "./DataSourceHandler/RemoteDataSourceHandler";

export type Handler = (
  props: BaseProps<any> & ElementInstances,
  observables: AttributeObservables
) => AttributeObservables;

export const handlers: Handler[] = [
  commandHandler, //
  localDataSourceHandler,
  remoteDataSourceHandler
];
