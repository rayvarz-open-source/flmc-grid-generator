import { map } from "rxjs/operators";
import { Handler } from "../Handlers";
import CustomFilterRowView from "./FilterRowView";
export const filterHandler: Handler = (props, observables) => {
  const componentOverride = observables.componentsOverride.pipe(
    map(v => {
      return {
        ...v,
        FilterRow: CustomFilterRowView
      };
    })
  );

  return {
    ...observables,
    componentsOverride: componentOverride
  };
};
