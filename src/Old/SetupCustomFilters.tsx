import { GridElement } from "flmc-lite-renderer/build/form/elements/grid/GridElement";
import CustomFilterRowView from "../Handlers/FilterHandler/FilterRowView";

export function setupCustomFilters(gridElement: GridElement) {
  gridElement.componentsOverride({
    FilterRow: CustomFilterRowView
  });
}
