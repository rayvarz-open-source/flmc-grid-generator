import { BehaviorSubject } from "rxjs";
import { Filter, FilterSchemaType } from "../../Models/Filter";
import { GridResultModel } from "../../Models/GridResultModel";
import { Sort } from "../../Models/Sort";

export type DataSourceFunctionOptions<Model = null> = {
  pageNo: number;
  pageSize: number;
  needSchema: boolean;
  needPagination: boolean;
  sorts: Sort<Model>[] | null;
  filters: Filter<Model>[];
};

export type DataSourceFunction<Model> = (options: DataSourceFunctionOptions<Model>) => Promise<GridResultModel<Model>>;
export type GeneralDataSourceFunction<Model> = (
  options: DataSourceFunctionOptions<Model> & { url: string }
) => Promise<GridResultModel<Model>>;

export type DataSource<Model> = BehaviorSubject<Model[]> | DataSourceFunction<Model>;
