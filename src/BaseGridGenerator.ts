import IElement from "flmc-lite-renderer/build/flmc-data-layer/FormController/IElement";
import { ContainerElement } from "flmc-lite-renderer/build/form/elements/container/ContainerElement";
import { GridElement } from "flmc-lite-renderer/build/form/elements/grid/GridElement";
import {
  ActionDefinitions,
  ColumnDefinitions,
  ComponentsOverride,
  Datasource,
  GridOptions,
  LocalizationDefinition,
  RowActionDefinitions,
  Title
} from "flmc-lite-renderer/build/form/elements/grid/GridElementAttributes";
import { ModalElement } from "flmc-lite-renderer/build/form/elements/modal/ModalElement";
import { Action } from "material-table";
import { BehaviorSubject, Observable } from "rxjs";
import { GridCommand } from "./CommandHandler/Commands";
import { CustomActionPosition } from "./CustomActionHandler/CustomActionPosition";
import { DataSource } from "./DataSourceHandler/DataSource";
import { handlers } from "./Handlers";
import { Filter } from "./Models/Filter";
import { Localization } from "./Models/Localization";
import { PaginationInfo } from "./Models/Pagination";
import { Schema } from "./Models/Schema";

export type BaseControllers<Model extends object> = {
  schemaController: BehaviorSubject<Schema>;
  filtersController: BehaviorSubject<Filter[]>;
  sortsController: BehaviorSubject<Filter[]>;
  paginationController: BehaviorSubject<PaginationInfo>;
  commandController: BehaviorSubject<GridCommand>;
  selectionController: BehaviorSubject<Model[]>;
  customActionsController: BehaviorSubject<Action<Model>[]>;
  containerController: BehaviorSubject<IElement[]>;
};

export type BaseOptions = {
  noHideColumnModel: Observable<boolean>;
  noExport: Observable<boolean>;
  noRefresh: Observable<boolean>;
  customActionsPosition: Observable<CustomActionPosition>;
  localization: Observable<Localization>;
};

export type BaseBuilders = {
  containerBuilder: () => ContainerElement;
  gridBuilder: () => GridElement;
  hideColumnModalBuilder: () => ModalElement;
  observablesBuilder: () => AttributeObservables;
};

/*
  let observables: AttributeObservables = {
    actionDefinitions: new BehaviorSubject<ActionDefinitions>([]).asObservable(),
    columnDefinitions: new BehaviorSubject<ColumnDefinitions>([]).asObservable(),
    componentsOverride: new BehaviorSubject<ComponentsOverride>({}).asObservable(),
    datasource: new BehaviorSubject<Datasource>([]).asObservable(),
    rowActionDefinitions: new BehaviorSubject<RowActionDefinitions>({}).asObservable(),
    gridOptions: new BehaviorSubject<GridOptions>({}).asObservable(),
    title: new BehaviorSubject<Title>("").asObservable(),
    localizationDefinition: new BehaviorSubject<LocalizationDefinition>({}).asObservable(),
  };

*/

export type BaseProps<Model extends object> = {
  dataSource: DataSource<Model>;
  options: BaseOptions;
  builders: BaseBuilders;
  controllers: BaseControllers<Model>;
};

export type AttributeObservables = {
  columnDefinitions: Observable<ColumnDefinitions>;
  actionDefinitions: Observable<ActionDefinitions>;
  componentsOverride: Observable<ComponentsOverride>;
  datasource: Observable<Datasource>;
  rowActionDefinitions: Observable<RowActionDefinitions>;
  gridOptions: Observable<GridOptions>;
  title: Observable<Title>;
  localizationDefinition: Observable<LocalizationDefinition>;
};

export function BaseGridGenerator<Model extends object>(props: BaseProps<Model>): IElement {
  // elements
  let containerElement = props.builders.containerBuilder().children(props.controllers.containerController);
  let gridElement = props.builders.gridBuilder();
  let hideColumnModalElement = props.builders.hideColumnModalBuilder();

  props.controllers.containerController.next([gridElement, hideColumnModalElement]);
  // attribute observables
  let observables = props.builders.observablesBuilder();
  // run handlers
  for (let handler of handlers) {
    observables = handler(props, observables);
  }
  // connect grid to observables
  gridElement
    .columnDefinitions(observables.columnDefinitions)
    .actionDefinitions(observables.actionDefinitions)
    .componentsOverride(observables.componentsOverride)
    .datasource(observables.datasource)
    .rowActionDefinitions(observables.rowActionDefinitions)
    .gridOptions(observables.gridOptions)
    .title(observables.title)
    .localizationDefinition(observables.localizationDefinition);

  return containerElement;
}
