import IElement from "flmc-lite-renderer/build/flmc-data-layer/FormController/IElement";
import { Label, Container, Button, ContainerDirection, Space, TextAlignment, TextSize } from "flmc-lite-renderer";
import { BehaviorSubject } from "rxjs";
import { GridResultModel, FilterSchemaType, Schema } from "./GridResultModel";
import Grid, { GridElement } from "flmc-lite-renderer/build/form/elements/grid/GridElement";
import { Sorts, Filter } from "./GridRequestModel";
import { DocumentModel } from "./DocumentModel";
import { materialTableFilterToGridFilter, isFilterChanged } from "./Filter";
import { setupGridWithSchema } from "./SetupGridWithSchema";
import { setupGridWithOptions } from "./SetupGridWithOptions";
import { setupImagePreviewModal } from "./SetupImagePreviewModal";
import { defaultOptions, Options } from "./Options";
import { setupGridSelection } from "./SetupSelection";

export type RemoteGridOptions<T> = Options<T> & {
  schema?: BehaviorSubject<Schema>;
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

  handleSchemaFetch(dataSourceFunction, containerChildren, options); // *** side effect

  return container;
}

async function handleSchemaFetch<Model>(
  datasource: DataSourceFunction<Model>,
  elementController: BehaviorSubject<IElement[]>,
  options: RemoteGridOptions<Model>
) {
  try {
    elementController.next([
      Container([
        Space().height(50),
        Label(options.localization.loading)
          .colors("secondary")
          .variant(TextSize.H6)
          .align(TextAlignment.Center),
        Space().height(50)
      ]).direction(ContainerDirection.Column)
    ]);

    let docuemntListOpen = new BehaviorSubject<boolean>(false);
    let docuemntList = new BehaviorSubject<DocumentModel[]>([]);
    let documentListElement = setupImagePreviewModal(docuemntList, docuemntListOpen);

    let gridElement = createGrid(datasource, options, {
      images: docuemntList,
      open: docuemntListOpen
    });
    elementController.next([await gridElement, documentListElement]);
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
  documentListModalController: DocumentListModel
): Promise<GridElement> {
  let gridElement = Grid();

  let refreshEvent = options.refreshController || new BehaviorSubject<null>(null);

  let currentPageData = new BehaviorSubject<Model[]>([]);
  let keyFieldName = new BehaviorSubject<string>("");

  let handleCheckedChange =
    options.selection == null
      ? undefined
      : setupGridSelection(gridElement, options.selection, currentPageData, keyFieldName);

  setupGridWithOptions(gridElement, options, refreshEvent, handleCheckedChange);

  let schema =
    options.schema ||
    new BehaviorSubject<Schema>({
      fields: [],
      filters: [],
      sorts: []
    });
  const handleDocumentList = (documents: DocumentModel[]) => {
    documentListModalController.images.next(documents);
    documentListModalController.open.next(true);
  };
  setupGridWithSchema(schema, gridElement, options, handleDocumentList);

  let needSchema = true;
  let cachedPageSize = 0;
  let lastFilters: Filter[] | null = null;

  gridElement.datasource(async query => {
    let filters = materialTableFilterToGridFilter(query.filters, schema.value);
    if (query.search) {
      filters.push({
        fieldName: "ALL",
        type: FilterSchemaType.LIKE,
        value: query.search
      });
    }

    let needPageSize = lastFilters == null || isFilterChanged(lastFilters, filters);
    lastFilters = filters;

    var result = await datasource({
      pageNo: query.page,
      pageSize: query.pageSize,
      needSchema: needSchema,
      needPagination: needPageSize,
      sorts:
        query.orderBy != null
          ? [
              {
                fieldName: query.orderBy.field as string,
                type: query.orderDirection.toUpperCase()
              }
            ]
          : null,
      filters: [...filters, ...(options.filters || [])]
    });

    if (needSchema) {
      needSchema = false;
      schema.next(result.schema);
      keyFieldName.next(result.schema.fields.filter(v => v.isKey)[0].fieldName);
    }

    if (needPageSize) {
      cachedPageSize = result.pagination.totalRow;
    }
    currentPageData.next(result.value);
    return {
      data: result.value.map(v => {
        let mixin = {};
        if (options.selection != null) {
          mixin = {
            ...mixin,
            tableData: {
              checked:
                options.selection.value.filter(selected => selected[keyFieldName.value] == v[keyFieldName.value])
                  .length > 0
            }
          };
        }

        return {
          ...v,
          ...mixin
        };
      }),
      page: needPageSize ? 0 : query.page,
      totalCount: cachedPageSize
    };
  });
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
