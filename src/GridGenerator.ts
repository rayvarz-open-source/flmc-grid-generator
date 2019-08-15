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
import {
  AttributeObservables,
  BaseBuilders,
  BaseControllers,
  BaseGridGenerator,
  BaseOptions
} from "./BaseGridGenerator";
import { GridCommand, GridCommands } from "./CommandHandler/Commands";
import { CustomActionPosition } from "./CustomActionHandler/CustomActionPosition";
import { DataSource } from "./DataSourceHandler/DataSource";
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
  customActionsController?: BehaviorSubject<Action<Model>[]>;
  containerController?: BehaviorSubject<IElement[]>;
};

export type Options = {
  noHideColumnModel?: Observable<boolean>;
  noExport?: Observable<boolean>;
  noRefresh?: Observable<boolean>;
  customActionsPosition?: Observable<CustomActionPosition>;
  localization?: Observable<Localization>;
};

export type Builders = {
  containerBuilder?: () => ContainerElement;
  gridBuilder?: () => GridElement;
  hideColumnModalBuilder?: () => ModalElement;
  observablesBuilder?: () => AttributeObservables;
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

export const defaultBuilders: BaseBuilders = {
  containerBuilder: () => new ContainerElement(),
  gridBuilder: () => new GridElement(),
  hideColumnModalBuilder: () => new ModalElement(),
  observablesBuilder: () => {
    return {
      actionDefinitions: new BehaviorSubject<ActionDefinitions>([]).asObservable(),
      columnDefinitions: new BehaviorSubject<ColumnDefinitions>([]).asObservable(),
      componentsOverride: new BehaviorSubject<ComponentsOverride>({}).asObservable(),
      datasource: new BehaviorSubject<Datasource>([]).asObservable(),
      rowActionDefinitions: new BehaviorSubject<RowActionDefinitions>({}).asObservable(),
      gridOptions: new BehaviorSubject<GridOptions>({}).asObservable(),
      title: new BehaviorSubject<Title>("").asObservable(),
      localizationDefinition: new BehaviorSubject<LocalizationDefinition>({}).asObservable()
    };
  }
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
    customActionsController:
      props.controllers && props.controllers.customActionsController
        ? props.controllers.customActionsController
        : new BehaviorSubject<Action<Model>[]>([]),
    containerController:
      props.controllers && props.controllers.containerController
        ? props.controllers.containerController
        : new BehaviorSubject<IElement[]>([])
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
    localization:
      props.options && props.options.localization
        ? props.options.localization
        : new BehaviorSubject<Localization>(defaultLocalization)
  };

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
        : defaultBuilders.hideColumnModalBuilder
  };

  return BaseGridGenerator<Model>({ controllers, options, dataSource: props.dataSource, builders });
}
