import { Localization as MLocalization } from "material-table";

export interface Localization {
  create: string;
  delete: string;
  errorFetchingSchema: string;
  loading: string;
  materialTable: MLocalization | undefined;
  refresh: string;
  retry: string;
  select: string;
  edit: string;
  columnVisibility: string;
  columnVisibilityTitle: string;
}
