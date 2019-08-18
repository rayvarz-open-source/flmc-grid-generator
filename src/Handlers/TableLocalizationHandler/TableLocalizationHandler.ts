import { combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { Handler } from "../Handlers";

export const tableLocalizationHandler: Handler = (props, observables) => {
  const localization = combineLatest(props.options.localization, observables.localizationDefinition).pipe(
    map(([option, def]) => {
      return {
        ...def,
        ...option.materialTable
      };
    })
  );

  return {
    ...observables,
    localizationDefinition: localization
  };
};
