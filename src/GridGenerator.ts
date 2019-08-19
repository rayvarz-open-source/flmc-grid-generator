import { ContainerDirection } from "flmc-lite-renderer";
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
import { BehaviorSubject, combineLatest, fromEvent, merge, Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import {
  AttributeObservables,
  BaseBuilders,
  BaseControllers,
  BaseGridGenerator,
  BaseOptions,
  FieldName
} from "./BaseGridGenerator";
import { GridCommand, GridCommands } from "./Handlers/CommandHandler/Commands";
import { CustomActionPosition } from "./Handlers/CustomActionHandler/CustomActionPosition";
import { DataSource } from "./Handlers/DataSourceHandler/DataSource";
import { Filter } from "./Models/Filter";
import { Localization } from "./Models/Localization";
import { PaginationInfo } from "./Models/Pagination";
import { Schema } from "./Models/Schema";
import { Sort } from "./Models/Sort";

export type Controllers<Model extends object> = {
  schemaController?: BehaviorSubject<Schema>;
  filtersController?: BehaviorSubject<Filter[]>;
  sortsController?: BehaviorSubject<Sort[]>;
  paginationController?: BehaviorSubject<PaginationInfo>;
  commandController?: BehaviorSubject<GridCommand>;
  selectionController?: BehaviorSubject<Model[]>;
  currentPageDataController?: BehaviorSubject<Model[]>;
  customActionsController?: BehaviorSubject<Action<Model>[]>;
  containerController?: BehaviorSubject<IElement[]>;
  keyFieldName?: BehaviorSubject<string>;
  hideColumnModalHiddenFieldsController: BehaviorSubject<FieldName[]>;
};

export type Options = {
  noHideColumnModel?: Observable<boolean>;
  noExport?: Observable<boolean>;
  noRefresh?: Observable<boolean>;
  customActionsPosition?: Observable<CustomActionPosition>;
  localization?: Observable<Localization>;
  enableSelection?: Observable<boolean> | boolean;
};

export type Builders = {
  containerBuilder?: () => ContainerElement;
  gridBuilder?: () => GridElement;
  hideColumnModalBuilder?: () => ModalElement;
  observablesBuilder?: () => AttributeObservables;
  documentListModalBuilder?: () => ModalElement;
  documentListContainerBuilder?: () => ContainerElement;
};

export type Props<Model extends object> = {
  dataSource: DataSource<Model>;
  options?: Options;
  builders?: BaseBuilders;
  controllers?: BaseControllers<Model>;
};

export const defaultLocalization: Localization = {
  create: "Create",
  delete: "Delete",
  errorFetchingSchema: "Error fetching schema",
  loading: "Loading...",
  materialTable: undefined,
  refresh: "Refresh",
  retry: "Retry",
  select: "Select",
  edit: "Edit",
  columnVisibility: "Hide/Show Columns",
  columnVisibilityTitle: "Hide/Show Columns"
};

export const makeDefaultBuilders = <Model extends object>(controllers: BaseControllers<Model>): BaseBuilders => {
  let windowResizeEvent = merge(
    of([window.innerHeight, window.innerWidth]),
    fromEvent(window, "resize").pipe(map((v: any): [number, number] => [window.innerHeight, window.innerWidth]))
  );

  return {
    containerBuilder: () => new ContainerElement(),
    gridBuilder: () => new GridElement(),
    hideColumnModalBuilder: () =>
      new ModalElement()
        .minWidth(windowResizeEvent.pipe(map(([height, width]) => width * 0.7)))
        .maxHeight(windowResizeEvent.pipe(map(([height, width]) => height)))
        .maxWidth(windowResizeEvent.pipe(map(([height, width]) => width)))
        .noBackdropClickClose(false)
        .noEscapeKeyDownClose(false),
    documentListModalBuilder: () => new ModalElement().noBackdropClickClose(false).noEscapeKeyDownClose(false),
    documentListContainerBuilder: () => new ContainerElement().direction(ContainerDirection.Row),
    observablesBuilder: () => {
      return {
        actionDefinitions: new BehaviorSubject<ActionDefinitions>([]).asObservable(),
        columnDefinitions: combineLatest(new BehaviorSubject<ColumnDefinitions>([]), controllers.schemaController),
        componentsOverride: new BehaviorSubject<ComponentsOverride>({}).asObservable(),
        datasource: new BehaviorSubject<Datasource>([]).asObservable(),
        rowActionDefinitions: new BehaviorSubject<RowActionDefinitions>({}).asObservable(),
        gridOptions: new BehaviorSubject<GridOptions>({
          actionsColumnIndex: -1,
          filtering: true,
          padding: "dense",
          pageSize: 5,
          initialPage: 0,
          pageSizeOptions: [5, 10, 20, 25, 50],
          debounceInterval: 0.7,
          loadingType: "linear"
        }).asObservable(),
        title: new BehaviorSubject<Title>("").asObservable(),
        localizationDefinition: new BehaviorSubject<LocalizationDefinition>({}).asObservable()
      };
    }
  };
};

export function GridGenerator<Model extends object>(props: Props<Model>): IElement {
  // handle default values

  let controllers: BaseControllers<Model> = {
    schemaController:
      props.controllers && props.controllers.schemaController
        ? props.controllers.schemaController
        : new BehaviorSubject<Schema>({ fields: [], sorts: [], filters: [] }),
    filtersController:
      props.controllers && props.controllers.filtersController
        ? props.controllers.filtersController
        : new BehaviorSubject<Filter[]>([]),
    sortsController:
      props.controllers && props.controllers.sortsController
        ? props.controllers.sortsController
        : new BehaviorSubject<Sort[]>([]),
    paginationController:
      props.controllers && props.controllers.paginationController
        ? props.controllers.paginationController
        : new BehaviorSubject<PaginationInfo>({ totalPage: 0, totalRow: 0 }),
    commandController:
      props.controllers && props.controllers.commandController
        ? props.controllers.commandController
        : new BehaviorSubject<GridCommand>(GridCommands.nop),
    selectionController:
      props.controllers && props.controllers.selectionController
        ? props.controllers.selectionController
        : new BehaviorSubject<Model[]>([]),
    currentPageDataController:
      props.controllers && props.controllers.currentPageDataController
        ? props.controllers.currentPageDataController
        : new BehaviorSubject<Model[]>([]),
    customActionsController:
      props.controllers && props.controllers.customActionsController
        ? props.controllers.customActionsController
        : new BehaviorSubject<Action<Model>[]>([]),
    containerController:
      props.controllers && props.controllers.containerController
        ? props.controllers.containerController
        : new BehaviorSubject<IElement[]>([]),
    keyFieldName:
      props.controllers && props.controllers.keyFieldName
        ? props.controllers.keyFieldName
        : new BehaviorSubject<string>(""),
    hideColumnModalHiddenFieldsController:
      props.controllers && props.controllers.hideColumnModalHiddenFieldsController
        ? props.controllers.hideColumnModalHiddenFieldsController
        : new BehaviorSubject<FieldName[]>([])
  };

  let options: BaseOptions = {
    customActionsPosition:
      props.options && props.options.customActionsPosition
        ? props.options.customActionsPosition
        : new BehaviorSubject<CustomActionPosition>(CustomActionPosition.End),
    noExport: props.options && props.options.noExport ? props.options.noExport : new BehaviorSubject<boolean>(false),
    noHideColumnModel:
      props.options && props.options.noHideColumnModel
        ? props.options.noHideColumnModel
        : new BehaviorSubject<boolean>(false),
    noRefresh: props.options && props.options.noRefresh ? props.options.noRefresh : new BehaviorSubject<boolean>(false),
    enableSelection:
      props.options && props.options.enableSelection
        ? typeof props.options.enableSelection === "boolean"
          ? new BehaviorSubject<boolean>(props.options.enableSelection)
          : props.options.enableSelection
        : new BehaviorSubject<boolean>(false),
    localization:
      props.options && props.options.localization
        ? props.options.localization
        : new BehaviorSubject<Localization>(defaultLocalization)
  };

  let defaultBuilders = makeDefaultBuilders<Model>(controllers);

  let builders: BaseBuilders = {
    containerBuilder:
      props.builders && props.builders.containerBuilder
        ? props.builders.containerBuilder
        : defaultBuilders.containerBuilder,
    gridBuilder:
      props.builders && props.builders.gridBuilder //
        ? props.builders.gridBuilder
        : defaultBuilders.gridBuilder,
    observablesBuilder:
      props.builders && props.builders.observablesBuilder
        ? props.builders.observablesBuilder
        : defaultBuilders.observablesBuilder,
    hideColumnModalBuilder:
      props.builders && props.builders.hideColumnModalBuilder
        ? props.builders.hideColumnModalBuilder
        : defaultBuilders.hideColumnModalBuilder,
    documentListContainerBuilder:
      props.builders && props.builders.documentListContainerBuilder
        ? props.builders.documentListContainerBuilder
        : defaultBuilders.documentListContainerBuilder,
    documentListModalBuilder:
      props.builders && props.builders.documentListModalBuilder
        ? props.builders.documentListModalBuilder
        : defaultBuilders.documentListModalBuilder
  };

  return BaseGridGenerator<Model>({ controllers, options, dataSource: props.dataSource, builders });
}
