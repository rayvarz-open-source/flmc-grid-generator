import { ContainerDirection, Raw } from "flmc-lite-renderer";
import IElement from "flmc-lite-renderer/build/flmc-data-layer/FormController/IElement";
import { ContainerElement } from "flmc-lite-renderer/build/form/elements/container/ContainerElement";
import { GridElement } from "flmc-lite-renderer/build/form/elements/grid/GridElement";
import { ActionDefinitions, ColumnDefinitions, ComponentsOverride, Datasource, GridOptions, LocalizationDefinition, OnRowClick, RowActionDefinitions, Title } from "flmc-lite-renderer/build/form/elements/grid/GridElementAttributes";
import { ModalElement } from "flmc-lite-renderer/build/form/elements/modal/ModalElement";
import { Action } from "material-table";
import * as React from "react";
import { BehaviorSubject, combineLatest, fromEvent, merge, Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { AttributeObservables, BaseBuilders, BaseControllers, BaseGridGenerator, BaseOptions, FieldName } from "./BaseGridGenerator";
import { AdvanceFilterContentProps, AdvanceFilterView } from "./Handlers/AdvanceFilterHandler/AdvanceFilterView";
import { GridCommand, GridCommands } from "./Handlers/CommandHandler/Commands";
import { CustomActionPosition } from "./Handlers/CustomActionHandler/CustomActionPosition";
import { DataSource, GeneralDataSourceFunction } from "./Handlers/DataSourceHandler/DataSource";
import { Filter, getFilterSchemaTypeName } from "./Models/Filter";
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
  hideColumnModalHiddenFieldsController?: BehaviorSubject<FieldName[]>;
  advanceFiltersController?: BehaviorSubject<Filter[]>;
  advanceFilterOpenController?: BehaviorSubject<boolean>;
  advanceFilterContentPropsController?: BehaviorSubject<AdvanceFilterContentProps>;
};

export type Options<Model> = {
  noHideColumnModel?: Observable<boolean>;
  noExport?: Observable<boolean>;
  noRefresh?: Observable<boolean>;
  customActionsPosition?: Observable<CustomActionPosition>;
  localization?: Observable<Localization>;
  enableSelection?: Observable<boolean> | boolean;
  listFilterDataSource?: GeneralDataSourceFunction<Model>;
  inlineEditCallBack?: (oldModel: Model, newModel: Model) => Promise<void>;
};

export type Builders = {
  containerBuilder?: () => ContainerElement;
  gridBuilder?: () => GridElement;
  hideColumnModalBuilder?: () => ModalElement;
  observablesBuilder?: () => AttributeObservables;
  documentListModalBuilder?: () => ModalElement;
  documentListContainerBuilder?: () => ContainerElement;
  listFilterModalBuilder?: () => ModalElement;
};

export type Props<Model extends object> = {
  dataSource: DataSource<Model>;
  options?: Options<Model>;
  builders?: BaseBuilders;
  controllers?: Controllers<Model>;
};

export const defaultLocalization: Localization = {
  create: "Create",
  delete: "Delete",
  errorFetchingSchema: "Error fetching schema",
  loading: "Loading...",
  advanceFilter: {
    and: "And",
    closeBracket: ")",
    openBracket: "(",
    or: "Or",
    actionTooltip: "Advance filter",
    andOperator: "And operator",
    apply: "Apply",
    cancel: "Cancel",
    fieldSectionHeader: "Fields",
    filterTypeTranslator: getFilterSchemaTypeName,
    generalSectionHeader: "General",
    orOperator: "Or operator",
    searchPlaceholder: 'Press "/" to search'
  },
  materialTable: {
    grouping: {
      groupedBy: "Grouped By:",
      placeholder: "Drag headers here to group by"
    },
    pagination: {
      labelDisplayedRows: "{from}-{to} of {count}",
      labelRowsPerPage: "Rows per page:",
      labelRowsSelect: "rows"
    },
    toolbar: {},
    header: {},
    body: {
      filterRow: {},
      editRow: {
        saveTooltip: "Save",
        cancelTooltip: "Cancel",
        deleteText: "Are you sure you want to delete this row?"
      },
      addTooltip: "Add",
      deleteTooltip: "Delete",
      editTooltip: "Edit"
    }
  },
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
    listFilterModalBuilder: () =>
      new ModalElement()
        .minWidth(windowResizeEvent.pipe(map(([height, width]) => width * 0.7)))
        .maxHeight(windowResizeEvent.pipe(map(([height, width]) => height)))
        .maxWidth(windowResizeEvent.pipe(map(([height, width]) => width)))
        .noBackdropClickClose(false)
        .visibleHeader(false)
        .noEscapeKeyDownClose(false)
        .noPadding(true),
    hideColumnModalBuilder: () =>
      new ModalElement()
        .minWidth(windowResizeEvent.pipe(map(([height, width]) => width * 0.7)))
        .maxHeight(windowResizeEvent.pipe(map(([height, width]) => height)))
        .maxWidth(windowResizeEvent.pipe(map(([height, width]) => width)))
        .noBackdropClickClose(false)
        .noEscapeKeyDownClose(false),
    documentListModalBuilder: () => new ModalElement().noBackdropClickClose(false).noEscapeKeyDownClose(false),
    documentListContainerBuilder: () => new ContainerElement().direction(ContainerDirection.Row),
    advanceFilterViewBuilder: props =>
      Raw(_ => <AdvanceFilterView open={props.open} contentProps={props.contentProps} />),
    observablesBuilder: () => {
      return {
        onRowClick: new BehaviorSubject<OnRowClick>(undefined),
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
        : new BehaviorSubject<FieldName[]>([]),
    advanceFiltersController:
      props.controllers && props.controllers.advanceFiltersController
        ? props.controllers.advanceFiltersController
        : new BehaviorSubject<Filter[]>([]),
    advanceFilterContentPropsController:
      props.controllers && props.controllers.advanceFilterContentPropsController
        ? props.controllers.advanceFilterContentPropsController
        : new BehaviorSubject<AdvanceFilterContentProps>({
            currentFilters: [],
            schema: { fields: [], filters: [], sorts: [] },
            localization: defaultLocalization.advanceFilter,
            onApply: _ => {},
            onCancel: () => {}
          }),
    advanceFilterOpenController:
      props.controllers && props.controllers.advanceFilterOpenController
        ? props.controllers.advanceFilterOpenController
        : new BehaviorSubject<boolean>(false)
  };

  let options: BaseOptions<Model> = {
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
        : new BehaviorSubject<Localization>(defaultLocalization),
    listFilterDataSource:
      props.options && props.options.listFilterDataSource ? props.options.listFilterDataSource : undefined,
    inlineEditCallBack: props.options && props.options.inlineEditCallBack ? props.options.inlineEditCallBack : undefined
  };

  let defaultBuilders = makeDefaultBuilders<Model>(controllers);

  let builders: BaseBuilders = {
    listFilterModalBuilder:
      props.builders && props.builders.listFilterModalBuilder
        ? props.builders.listFilterModalBuilder
        : defaultBuilders.listFilterModalBuilder,
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
        : defaultBuilders.documentListModalBuilder,
    advanceFilterViewBuilder:
      props.builders && props.builders.advanceFilterViewBuilder
        ? props.builders.advanceFilterViewBuilder
        : defaultBuilders.advanceFilterViewBuilder
  };

  return BaseGridGenerator<Model>({ controllers, options, dataSource: props.dataSource, builders });
}
