import { Datasource } from "flmc-lite-renderer/build/form/elements/grid/GridElementAttributes";
import { BehaviorSubject } from "rxjs";
import { Filter, FilterSchemaType } from "../../Models/Filter";
import { Schema } from "../../Models/Schema";
import { isFilterChanged, materialTableFilterToGridFilter } from "../FilterHandler/materialTableFilterToGridFilter";
import { Handler } from "../Handlers";
import { DataSourceFunction } from "./DataSource";

export const remoteDataSourceHandler: Handler = (props, observables) => {
  if (typeof props.dataSource !== "function") return observables;
  // TODO: seprate filter and sort logic
  let isSelectionEnabled = false;
  props.options.enableSelection.subscribe(v => (isSelectionEnabled = v));

  const dataSourceFunction: DataSourceFunction<any> = props.dataSource;

  let needSchema = true;
  let cachedPageSize = 0;
  let lastFilters: Filter[] | null = null;

  let dataSourceObservable = new BehaviorSubject<Datasource>(async query => {
    let filters = materialTableFilterToGridFilter(query.filters, props.controllers.schemaController.value);
    if (query.search) {
      filters.push({
        fieldName: "ALL",
        type: FilterSchemaType.LIKE,
        value: query.search
      });
    }

    let needPageSize = lastFilters == null || isFilterChanged(lastFilters, filters);
    lastFilters = filters;

    let requestFilters = [...filters, ...props.controllers.advanceFiltersController.value];

    var result = await dataSourceFunction({
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
      filters: requestFilters
    });

    props.controllers.filtersController.next(requestFilters);

    if (needSchema) {
      needSchema = false;
      props.controllers.schemaController.next(result.schema);
      props.controllers.keyFieldName.next(result.schema.fields.filter(v => v.isKey)[0].fieldName);
    }

    if (needPageSize) {
      props.controllers.paginationController.next(result.pagination);
      cachedPageSize = result.pagination.totalRow;
    }
    const proccessedResult = processResultValue(result.value, props.controllers.schemaController.value);
    props.controllers.currentPageDataController.next(proccessedResult);
    return {
      data: proccessedResult.map(v => {
        let mixin = {};
        if (isSelectionEnabled) {
          mixin = {
            ...mixin,
            tableData: {
              checked:
                props.controllers.selectionController.value.filter(
                  selected => selected[props.controllers.keyFieldName.value] == v[props.controllers.keyFieldName.value]
                ).length > 0
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

  return {
    ...observables,
    datasource: dataSourceObservable
  };
};

export function processResultValue(originalItems: any[], schema: Schema): any[] {
  let items = [...originalItems];
  // handle refrence values, e.g: @barcode
  let refrenceNames = schema.fields.map(field => `@${field.fieldName}`);

  const hasRefrenceName = (value: string) => {
    for (let refrenceName of refrenceNames) {
      if (value.includes(refrenceName)) return true;
    }
    return false;
  };

  schema.fields.forEach(field => {
    if (
      field.type &&
      field.type.source &&
      typeof field.type.source.values === "string" &&
      hasRefrenceName(field.type.source.values)
    ) {
      // change row data with refrence value
      for (let row of items) {
        let col = field.type.source.values + "";
        for (let refrenceName of refrenceNames) col = col.replace(refrenceName, row[refrenceName.substring(1)] + "");
        row[field.fieldName] = col;
      }
    }
  });

  return items;
}
