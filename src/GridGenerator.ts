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

export function createGridViaDataSource<Model>(
  dataSourceAddress: string,
  options: Options<Model> = defaultOptions
): IElement {
  let containerChildren = new BehaviorSubject<IElement[]>([]);
  let container = Container(containerChildren);

  handleSchemaFetch(dataSourceAddress, containerChildren, options); // *** side effect

  return container;
}

async function handleSchemaFetch<Model>(
  datasourceAddress: string,
  elementController: BehaviorSubject<IElement[]>,
  options: Options<Model>
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

    let gridElement = createGrid(datasourceAddress, options, {
      images: docuemntList,
      open: docuemntListOpen
    });
    elementController.next([await gridElement, documentListElement]);
  } catch (e) {
    elementController.next([
      Label(options.localization.errorFetchingSchema).colors("primary"),
      Button(options.localization.retry).onClick(() => handleSchemaFetch(datasourceAddress, elementController, options))
    ]);
  }
}

type DocumentListModel = {
  images: BehaviorSubject<DocumentModel[]>;
  open: BehaviorSubject<boolean>;
};

async function createGrid<Model>(
  datasourceAddress: string,
  options: Options<Model>,
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

  const handleDocumentList = (documents: DocumentModel[]) => {
    documentListModalController.images.next(documents);
    documentListModalController.open.next(true);
  };

  let currentSchema: Schema = {
    fields: [],
    filters: [],
    sorts: []
  };

  let needSchema = true;
  let cachedPageSize = 0;
  let lastFilters: Filter[] | null = null;

  gridElement.datasource(async query => {
    let filters = materialTableFilterToGridFilter(query.filters, currentSchema);
    if (query.search) {
      filters.push({
        fieldName: "ALL",
        type: FilterSchemaType.LIKE,
        value: query.search
      });
    }

    let needPageSize = lastFilters == null || isFilterChanged(lastFilters, filters);
    lastFilters = filters;

    var result = await fetchData(
      datasourceAddress,
      query.page,
      query.pageSize,
      needSchema,
      needPageSize,
      query.orderBy != null
        ? [
            {
              fieldName: query.orderBy.field as string,
              type: query.orderDirection.toUpperCase()
            }
          ]
        : null,
      [...filters, ...(options.filters || [])]
    );

    if (needSchema) {
      needSchema = false;
      currentSchema = result.schema;
      setupGridWithSchema(result.schema, gridElement, options, handleDocumentList);
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
