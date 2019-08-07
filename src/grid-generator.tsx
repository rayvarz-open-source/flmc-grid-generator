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
import { GridResultModel, SortSchemaType, FieldShemaTypeName, FilterSchemaType, Schema, FieldSchema } from "models";
import Grid, { GridElement } from "flmc-lite-renderer/form/elements/grid/GridElement";
import { Sorts, Filter } from "./GridRequestModel";
import { ActionDefinitions } from "flmc-lite-renderer/form/elements/grid/GridElementAttributes";
import { language } from "localizations/language";
import { Icon } from "@material-ui/core";
// @ts-ignore

import { DocumentModel } from "./DocumentModel";
// import { map } from "rxjs/operators";
// import * as _momentJalali from "moment-jalali";
// const momentJalali = _momentJalali;

// TODO: seperate to fiels and document

type Options<T> = {
  onEdit?: (model: T) => void;
  onDelete?: (model: T) => Promise<boolean>;
  onCreate?: () => void;
  onSelect?: (model: T) => void;
  refreshController?: BehaviorSubject<null>;
  filters?: Filter[];
};

export function createGridViaDataSource<Model>(dataSourceAddress: string, options: Options<Model> = {}): IElement {
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
        Label("Loading")
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
      Label("Error fetching schema").colors("primary"),
      Button("Retry").onClick(() => handleSchemaFetch(datasourceAddress, elementController, options))
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

  gridElement.localizationDefinition({});

  gridElement.gridOptions({
    actionsColumnIndex: -1,
    filtering: true,
    padding: "default",
    selection: false,
    pageSize: 5,
    initialPage: 0,
    pageSizeOptions: [5, 10, 20, 25, 50]
  });

  gridElement.refreshEvent(refreshEvenet);

  let actionDefinitions: ActionDefinitions = [];

  actionDefinitions.push({
    icon: "refresh",
    isFreeAction: true,
    tooltip: "Refresh",
    onClick: (event: any, data: Model) => refreshEvenet.next(null)
  });

  if (options.onCreate != null) {
    actionDefinitions.push({
      icon: "add_box",
      isFreeAction: true,
      tooltip: "Create",
      onClick: (event: any, data: Model) => options.onCreate!()
    });
  }

  if (options.onEdit != null) {
    actionDefinitions.push({
      icon: "edit_box",
      isFreeAction: false,
      tooltip: "Edit",
      onClick: (event: any, data: Model) => options.onEdit!(data)
    });
  }

  if (options.onSelect != null) {
    actionDefinitions.push({
      icon: "check",
      isFreeAction: false,
      tooltip: "Select",
      onClick: (event: any, data: Model) => options.onSelect!(data)
    });
  }

  if (options.onDelete != null) {
    actionDefinitions.push({
      icon: "delete_box",
      isFreeAction: false,
      tooltip: "Delete",
      onClick: async (event: any, data: Model) => {
        if (await options.onDelete!(data as Model)) {
          // TODO: refresh
        }
      }
    });
  }

  gridElement.actionDefinitions(actionDefinitions);

  // get schema

  let schemaOnlyResult = await fetchData(datasourceAddress, 0, 0, true, true, null, options.filters || []);

  const handleDocumentList = (documents: DocumentModel[]) => {
    documentListModalController.images.next(documents);
    documentListModalController.open.next(true);
  };

  gridElement.columnDefinitions(
    schemaOnlyResult.schema.fields
      .filter(field => field.isVisible)
      .sort((current, next) => next.order - current.order)
      .reverse()
      .map(field => {
        let filtering = false;
        if (field.type.name == FieldShemaTypeName.Int)
          filtering =
            schemaOnlyResult.schema.filters.filter(
              filter => filter.fieldName == field.fieldName && filter.type == FilterSchemaType.EQUAL_BY
            ).length > 0;
        if (field.type.name == FieldShemaTypeName.String)
          filtering =
            schemaOnlyResult.schema.filters.filter(
              filter => filter.fieldName == field.fieldName && filter.type == FilterSchemaType.LIKE
            ).length > 0;
        let definition: any = {
          field: field.fieldName,
          title: field.title,
          editable: field.isEditable ? "always" : "never",
          filtering: filtering,
          sorting:
            schemaOnlyResult.schema.sorts.filter(
              sort => sort.fieldName == field.fieldName && sort.type == SortSchemaType.All
            ).length > 0
        };

        let customRenderer = handleCustomComponentRenderer(field, {
          onImageListClick: documents => handleDocumentList(documents)
        });

        if (customRenderer) definition.render = customRenderer;

        return definition;
      })
  );

  let totalCount: number = schemaOnlyResult.pagination.totalPage;

  gridElement.datasource(async query => {
    let filters = materialTableFilterToGridFilter(query.filters, schemaOnlyResult.schema);
    if (query.search) {
      filters.push({
        fieldName: "ALL",
        type: FilterSchemaType.LIKE,
        value: query.search
      });
    }
    var result = await fetchData(
      datasourceAddress,
      query.page,
      query.pageSize,
      false,
      false,
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
    return {
      data: result.value,
      page: query.page,
      totalCount: totalCount!
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
    // case FieldShemaTypeName.PersianDate:
    //   return rowData => {
    //     let date = rowData[field.fieldName];
    //     if (!date) return <p> - </p>;
    //     return <p>{momentJalali(new Date(date).toISOString()).format("jYYYY/jM/jD")}</p>;
    //   };
    // case FieldShemaTypeName.GregorianDateTime:
    //   return rowData => {
    //     let date = rowData[field.fieldName];
    //     if (!date) return <p> - </p>;
    //     return <p>{momentJalali(new Date(date).toISOString()).format("YYYY/M/D")}</p>;
    //   };
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
    <div className="grid-image-container">
      {documents.map((image, index) => (
        <a key={index + "_GridImageCell"} onClick={() => onClick()}>
          <img
            src={image.thumb}
            className="grid-image"
            style={{
              marginRight: index * 9,
              zIndex: index + 1000
            }}
          />
        </a>
      ))}
    </div>
  );
}
