import * as React from "react";
import IElement from "flmc-lite-renderer/build/flmc-data-layer/FormController/IElement";
import {
  Label,
  Container,
  Button,
  Modal,
  Image,
  ContainerDirection,
  ImageScaleType,
  Space,
  Alignment,
  TextAlignment,
  TextSize
} from "flmc-lite-renderer";
import { BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import {
  GridResultModel,
  SortSchemaType,
  FieldShemaTypeName,
  FilterSchemaType,
  Schema,
  FieldSchema
} from "./GridResultModel";
import Grid, { GridElement } from "flmc-lite-renderer/build/form/elements/grid/GridElement";
import { Sorts, Filter } from "./GridRequestModel";
import {
  ActionDefinitions,
  LocalizationDefinition
} from "flmc-lite-renderer/build/form/elements/grid/GridElementAttributes";
import { Icon } from "@material-ui/core";
import { DocumentModel } from "./DocumentModel";
// @ts-ignore
import _momentJalali from "moment-jalali";
const momentJalali = _momentJalali;

// TODO: seperate to fiels and document

type Options<T> = {
  onEdit?: (model: T) => void;
  onDelete?: (model: T) => Promise<boolean>;
  onCreate?: () => void;
  onSelect?: (model: T) => void;
  refreshController?: BehaviorSubject<null>;
  filters?: Filter[];
  hideFields?: string[];
  localization: {
    materialTable: LocalizationDefinition;
    loading: string;
    errorFetchingSchema: string;
    retry: string;
    refresh: string;
    create: string;
    select: string;
    delete: string;
    edit: string;
  };
};

export function createGridViaDataSource<Model>(
  dataSourceAddress: string,
  options: Options<Model> = {
    localization: {
      create: "Create",
      delete: "Delete",
      errorFetchingSchema: "Error fetching schema",
      loading: "Loading...",
      materialTable: undefined,
      refresh: "Refresh",
      retry: "Retry",
      select: "Select",
      edit: "Edit"
    }
  }
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
    let documentListImageElement = docuemntList.pipe(
      map(v =>
        v.map(document =>
          Image(document.original)
            .height(250)
            .width(250)
            .scale(ImageScaleType.Contain)
        )
      )
    );
    let documentListElement = Modal(Container(documentListImageElement).direction(ContainerDirection.Row)).open(
      docuemntListOpen
    );

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

  let refreshEvenet = options.refreshController || new BehaviorSubject<null>(null);

  gridElement.localizationDefinition(options.localization.materialTable);

  gridElement.gridOptions({
    actionsColumnIndex: -1,
    filtering: true,
    padding: "dense",
    selection: false,
    pageSize: 5,
    initialPage: 0,
    pageSizeOptions: [5, 10, 20, 25, 50],
    debounceInterval: 0.7,
    loadingType: "linear"
  });

  gridElement.refreshEvent(refreshEvenet);

  let actionDefinitions: ActionDefinitions = [];

  actionDefinitions.push({
    icon: "refresh",
    isFreeAction: true,
    tooltip: options.localization.refresh,
    onClick: (event: any, data: Model) => refreshEvenet.next(null)
  });

  if (options.onCreate != null) {
    actionDefinitions.push({
      icon: "add_box",
      isFreeAction: true,
      tooltip: options.localization.create,
      onClick: (event: any, data: Model) => options.onCreate!()
    });
  }

  if (options.onEdit != null) {
    actionDefinitions.push({
      icon: "edit_box",
      isFreeAction: false,
      tooltip: options.localization.edit,
      onClick: (event: any, data: Model) => options.onEdit!(data)
    });
  }

  if (options.onSelect != null) {
    actionDefinitions.push({
      icon: "check",
      isFreeAction: false,
      tooltip: options.localization.select,
      onClick: (event: any, data: Model) => options.onSelect!(data)
    });
  }

  if (options.onDelete != null) {
    actionDefinitions.push({
      icon: "delete_box",
      isFreeAction: false,
      tooltip: options.localization.delete,
      onClick: async (event: any, data: Model) => {
        if (await options.onDelete!(data as Model)) {
          // TODO: refresh
        }
      }
    });
  }

  gridElement.actionDefinitions(actionDefinitions);

  // get schema

  const handleDocumentList = (documents: DocumentModel[]) => {
    documentListModalController.images.next(documents);
    documentListModalController.open.next(true);
  };

  let currentSchema: Schema = {
    fields: [],
    filters: [],
    sorts: []
  };

  function updateSchema(schema: Schema) {
    currentSchema = schema;
    let hiddenFields = options.hideFields || [];

    gridElement.columnDefinitions(
      schema.fields
        .filter(field => field.isVisible && !hiddenFields.includes(field.fieldName))
        .sort((current, next) => next.order - current.order)
        .reverse()
        .map(field => {
          let filtering = false;
          if (field.type.name == FieldShemaTypeName.Int)
            filtering =
              schema.filters.filter(
                filter => filter.fieldName == field.fieldName && filter.type == FilterSchemaType.EQUAL_BY
              ).length > 0;
          if (field.type.name == FieldShemaTypeName.String)
            filtering =
              schema.filters.filter(
                filter => filter.fieldName == field.fieldName && filter.type == FilterSchemaType.LIKE
              ).length > 0;
          let definition: any = {
            field: field.fieldName,
            title: field.title,
            editable: field.isEditable ? "always" : "never",
            filtering: filtering,
            sorting:
              schema.sorts.filter(sort => sort.fieldName == field.fieldName && sort.type == SortSchemaType.All).length >
              0
          };

          let customRenderer = handleCustomComponentRenderer(field, {
            onImageListClick: documents => handleDocumentList(documents)
          });

          if (customRenderer) definition.render = customRenderer;

          return definition;
        })
    );
  }

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
      updateSchema(result.schema);
    }

    if (needPageSize) {
      cachedPageSize = result.pagination.totalPage;
    }

    return {
      data: result.value,
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

function isFilterChanged(oldFilters: Filter[], newFilters: Filter[]): boolean {
  if (oldFilters.length != newFilters.length) return true;
  for (let filter of newFilters) {
    if (
      oldFilters.filter(v => v.fieldName === filter.fieldName && v.type === filter.type && v.value === filter.value)
        .length === 0
    )
      return true;
  }
  return false;
}

function materialTableFilterToGridFilter(filters: any[], schema: Schema): Filter[] {
  return filters.map(
    (filter): Filter => {
      let fieldName = filter.column.field;
      let fieldType = schema.fields.filter(field => field.fieldName == fieldName)[0].type.name;

      let value: number | string | null = null;
      if (fieldType == FieldShemaTypeName.Int && !isNaN(filter.value)) value = parseInt(filter.value);
      if (fieldType == FieldShemaTypeName.String) value = filter.value;

      return {
        fieldName: fieldName,
        type: fieldType == FieldShemaTypeName.Int ? FilterSchemaType.EQUAL_BY : FilterSchemaType.LIKE,
        value: value
      };
    }
  );
}

type RowRenderer = (rowData: any) => React.ReactElement;

type CallBacks = {
  onImageListClick: (documents: DocumentModel[]) => void;
};

/**
 * Number.prototype.format(n, x)
 *
 * @param integer n: length of decimal
 * @param integer x: length of sections
 */
const formatMoney = function(value: number, n: number, x: number) {
  var re = "\\d(?=(\\d{" + (x || 3) + "})+" + (n > 0 ? "\\." : "$") + ")";
  return value.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, "g"), "$&,");
};

function handleCustomComponentRenderer(field: FieldSchema, callbacks: CallBacks): RowRenderer | undefined {
  switch (field.type.name) {
    case FieldShemaTypeName.Money:
      return rowData => <p>{formatMoney(rowData[field.fieldName], 0, 3)}</p>;
    case FieldShemaTypeName.Bit:
      return rowData => <Icon>{rowData[field.fieldName] ? "check" : "close"}</Icon>;
    case FieldShemaTypeName.PersianDate:
      return rowData => {
        let date = rowData[field.fieldName];
        if (!date) return <p> - </p>;
        return <p>{momentJalali(new Date(date).toISOString()).format("jYYYY/jM/jD")}</p>;
      };
    case FieldShemaTypeName.GregorianDateTime:
      return rowData => {
        let date = rowData[field.fieldName];
        if (!date) return <p> - </p>;
        return <p>{momentJalali(new Date(date).toISOString()).format("YYYY/M/D")}</p>;
      };
    case FieldShemaTypeName.Image:
      return rowData => {
        let document = rowData[field.fieldName] == null ? [] : [rowData[field.fieldName]];
        return <GridImageCell onClick={() => callbacks.onImageListClick(document)} documents={document} />;
      };
    case FieldShemaTypeName.String:
      if (!field.fieldName.toLowerCase().includes("title")) return undefined; // TODO: get this from server
      return rowData => <p style={{ minWidth: 150 }}>{rowData[field.fieldName]}</p>;
    case FieldShemaTypeName.ImageList:
      return rowData => (
        <GridImageCell
          onClick={() => callbacks.onImageListClick(rowData[field.fieldName])}
          documents={rowData[field.fieldName]}
        />
      );
    default:
      return undefined;
  }
}

type Props = {
  documents: DocumentModel[];
  onClick: () => void;
};

function GridImageCell({ documents, onClick }: Props): React.ReactElement {
  return (
    <div
      style={{
        flexDirection: "row",
        position: "relative"
      }}
    >
      {documents.map((image, index) => (
        <a key={index + "_GridImageCell"} onClick={() => onClick()}>
          <img
            src={image.thumb}
            style={{
              transform: "translateY(-25px)",
              width: 50,
              height: 50,
              borderRadius: 5,
              position: "absolute",
              display: "block",
              boxShadow: "1px 1px 1px white",
              transition: "0.2s",
              cursor: "pointer",
              marginRight: index * 9,
              zIndex: index + 1000
            }}
          />
        </a>
      ))}
    </div>
  );
}
