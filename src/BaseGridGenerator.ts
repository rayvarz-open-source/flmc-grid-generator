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
import { map } from "rxjs/operators";
import { GridCommand } from "./Handlers/CommandHandler/Commands";
import { CustomActionPosition } from "./Handlers/CustomActionHandler/CustomActionPosition";
import { DataSource } from "./Handlers/DataSourceHandler/DataSource";
import { handlers } from "./Handlers/Handlers";
import { Filter } from "./Models/Filter";
import { Localization } from "./Models/Localization";
import { PaginationInfo } from "./Models/Pagination";
import { Schema } from "./Models/Schema";
import { Sort } from "./Models/Sort";

export type BaseControllers<Model extends object> = {
  schemaController: BehaviorSubject<Schema>;
  filtersController: BehaviorSubject<Filter[]>;
  sortsController: BehaviorSubject<Sort[]>;
  paginationController: BehaviorSubject<PaginationInfo>;
  commandController: BehaviorSubject<GridCommand>;
  selectionController: BehaviorSubject<Model[]>;
  currentPageDataController: BehaviorSubject<Model[]>;
  customActionsController: BehaviorSubject<Action<Model>[]>;
  containerController: BehaviorSubject<IElement[]>;
  keyFieldName: BehaviorSubject<string>;
};

export type BaseOptions = {
  noHideColumnModel: Observable<boolean>;
  enableSelection: Observable<boolean>;
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
  documentListModalBuilder: () => ModalElement;
  documentListContainerBuilder: () => ContainerElement;
};

export type ElementInstances = {
  elements: {
    container: ContainerElement;
    grid: GridElement;
    hideColumnModal: ModalElement;
    documentListModal: ModalElement;
    documentListContainer: ContainerElement;
  };
};

export type BaseProps<Model extends object> = {
  dataSource: DataSource<Model>;
  options: BaseOptions;
  builders: BaseBuilders;
  controllers: BaseControllers<Model>;
};

export type AttributeObservables = {
  columnDefinitions: Observable<[ColumnDefinitions, Schema]>;
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
  let documentListContainer = props.builders.documentListContainerBuilder();
  let documentListModal = props.builders.documentListModalBuilder().child(documentListContainer);

  let elements: ElementInstances = {
    elements: {
      container: containerElement,
      grid: gridElement,
      hideColumnModal: hideColumnModalElement,
      documentListContainer: documentListContainer,
      documentListModal: documentListModal
    }
  };

  props.controllers.containerController.next([gridElement, hideColumnModalElement, documentListModal]);
  // attribute observables
  let observables = props.builders.observablesBuilder();
  // run handlers
  for (let handler of handlers) {
    observables = handler({ ...props, ...elements }, observables);
  }
  // connect grid to observables
  gridElement
    .columnDefinitions(observables.columnDefinitions.pipe(map(v => v[0])))
    .actionDefinitions(observables.actionDefinitions)
    .componentsOverride(observables.componentsOverride)
    .datasource(observables.datasource)
    .rowActionDefinitions(observables.rowActionDefinitions)
    .gridOptions(observables.gridOptions)
    .title(observables.title)
    .localizationDefinition(observables.localizationDefinition);

  return containerElement;
}
