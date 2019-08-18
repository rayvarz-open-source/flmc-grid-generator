import { Button, Container, Label } from "flmc-lite-renderer";
import IElement from "flmc-lite-renderer/build/flmc-data-layer/FormController/IElement";
import Grid, { GridElement } from "flmc-lite-renderer/build/form/elements/grid/GridElement";
import { BehaviorSubject } from "rxjs";
import { DocumentModel } from "../Models/DocumentModel";
import { Filter, Sorts } from "./GridRequestModel";
import { GridResultModel, PaginationInfo, Schema } from "./GridResultModel";
import { defaultOptions, Options } from "./Options";
import { setupCustomFilters } from "./SetupCustomFilters";
import { setupGridWithOptions } from "./SetupGridWithOptions";
import { setupGridWithSchema } from "./SetupGridWithSchema";
import { HideColumnsController, setupHideColumnModal } from "./SetupHideColumnModal";
import { setupImagePreviewModal } from "./SetupImagePreviewModal";
import { setupGridSelection } from "./SetupSelection";

export type RemoteGridOptions<T> = Options<T> & {
  schema?: BehaviorSubject<Schema>;
  pagination?: BehaviorSubject<PaginationInfo>;
  filtersController?: BehaviorSubject<Filter[]>;
};

export type DataSource<T> = string | DataSourceFunction<T>;

export function createGridViaDataSource<Model>(
  dataSource: DataSource<Model>,
  options: RemoteGridOptions<Model> = defaultOptions
): IElement {
  let containerChildren = new BehaviorSubject<IElement[]>([]);
  let container = Container(containerChildren);

  const dataSourceFunction =
    typeof dataSource === "string"
      ? (props: DataSourceOptions) =>
          fetchData(
            dataSource,
            props.pageNo,
            props.pageSize,
            props.needSchema,
            props.needPagination,
            props.sorts,
            props.filters
          )
      : dataSource;

  if (options.schema == null)
    options.schema = new BehaviorSubject<Schema>({
      fields: [],
      filters: [],
      sorts: []
    });

  if (options.pagination == null)
    options.pagination = new BehaviorSubject<PaginationInfo>({
      totalPage: 0,
      totalRow: 0
    });

  if (options.filtersController == null) options.filtersController = new BehaviorSubject<Filter[]>([]);

  handleSchemaFetch(dataSourceFunction, containerChildren, options); // *** side effect

  return container;
}

async function handleSchemaFetch<Model>(
  datasource: DataSourceFunction<Model>,
  elementController: BehaviorSubject<IElement[]>,
  options: RemoteGridOptions<Model>
) {
  try {
    let docuemntListOpen = new BehaviorSubject<boolean>(false);
    let docuemntList = new BehaviorSubject<DocumentModel[]>([]);
    let documentListElement = setupImagePreviewModal(docuemntList, docuemntListOpen);
    let hideColumnsModalController = setupHideColumnModal(options.schema!, options);

    let gridElement = createGrid(
      datasource,
      options,
      {
        images: docuemntList,
        open: docuemntListOpen
      },
      hideColumnsModalController
    );
    elementController.next([await gridElement, documentListElement, hideColumnsModalController.element]);
  } catch (e) {
    elementController.next([
      Label(options.localization.errorFetchingSchema).colors("primary"),
      Button(options.localization.retry).onClick(() => handleSchemaFetch(datasource, elementController, options))
    ]);
  }
}

type DocumentListModel = {
  images: BehaviorSubject<DocumentModel[]>;
  open: BehaviorSubject<boolean>;
};

async function createGrid<Model>(
  datasource: DataSourceFunction<Model>,
  options: RemoteGridOptions<Model>,
  documentListModalController: DocumentListModel,
  hideColumnController: HideColumnsController
): Promise<GridElement> {
  let gridElement = Grid();

  let refreshEvent = options.refreshController || new BehaviorSubject<null>(null);

  let currentPageData = new BehaviorSubject<Model[]>([]);
  let keyFieldName = new BehaviorSubject<string>("");

  let handleCheckedChange =
    options.selection == null
      ? undefined
      : setupGridSelection(gridElement, options.selection, currentPageData, keyFieldName);

  setupGridWithOptions(gridElement, options, refreshEvent, handleCheckedChange, hideColumnController);

  let schema = options.schema!;

  setupGridWithSchema(schema, gridElement, options, handleDocumentList);

  setupCustomFilters(gridElement);

  return gridElement;
}

export type DataSourceOptions = {
  pageNo: number;
  pageSize: number;
  needSchema: boolean;
  needPagination: boolean;
  sorts: Sorts | null;
  filters: Filter[];
};
export type DataSourceFunction<Model> = (options: DataSourceOptions) => Promise<GridResultModel<Model>>;

// TODO: get single object
async function fetchData(
  datasourceAddress: string,
  pageNo: number,
  pageSize: number,
  needSchema: boolean,
  needPagination: boolean,
  sorts: Sorts | null = null,
  filters: Filter[] = []
): Promise<GridResultModel<any>> {
  return (await fetch(datasourceAddress, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      schema: needSchema,
      pagination: {
        needInfo: needPagination,
        pageNo: pageNo,
        pageSize: pageSize
      },
      sorts: sorts,
      filters: filters
    })
  })).json();
}
