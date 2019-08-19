import { BehaviorSubject } from "rxjs";
import { Filter } from "../../Models/Filter";
import { GridResultModel } from "../../Models/GridResultModel";
import { Sort } from "../../Models/Sort";

export type DataSourceFunctionOptions = {
  pageNo: number;
  pageSize: number;
  needSchema: boolean;
  needPagination: boolean;
  sorts: Sort[] | null;
  filters: Filter[];
};

export type DataSourceFunction<Model> = (options: DataSourceFunctionOptions) => Promise<GridResultModel<Model>>;
export type GeneralDataSourceFunction<Model> = (
  options: DataSourceFunctionOptions & { url: string }
) => Promise<GridResultModel<Model>>;

export type DataSource<Model> = BehaviorSubject<Model[]> | DataSourceFunction<Model>;
