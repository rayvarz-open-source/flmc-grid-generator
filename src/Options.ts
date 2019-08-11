import { BehaviorSubject } from "rxjs";
import { Filter } from "./GridRequestModel";
import { LocalizationDefinition } from "flmc-lite-renderer/build/form/elements/grid/GridElementAttributes";

export type Options<T> = {
  onEdit?: (model: T) => void;
  onDelete?: (model: T) => Promise<boolean>;
  onCreate?: () => void;
  onSelect?: (model: T) => void;
  selection?: BehaviorSubject<T[]>;
  refreshController?: BehaviorSubject<null>;
  filters?: Filter[];
  hideFields?: string[];
  export?: boolean;
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

export const defaultOptions = {
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
};
