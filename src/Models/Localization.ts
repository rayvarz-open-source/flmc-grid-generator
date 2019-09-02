import { Localization as MLocalization } from "material-table";
import { AdvanceFilterLocalization } from "../Handlers/AdvanceFilterHandler/AdvanceFilterView";

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
  advanceFilter: AdvanceFilterLocalization;
  columnVisibility: string;
  columnVisibilityTitle: string;
}
