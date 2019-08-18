import { combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { Handler } from "../Handlers";
import { CustomActionPosition } from "./CustomActionPosition";

export const customActionHandler: Handler = (props, observables) => {
  const actions = combineLatest(
    props.options.customActionsPosition,
    props.controllers.customActionsController,
    observables.actionDefinitions
  ).pipe(
    map(([position, customActions, currentActions]) => {
      if (position === CustomActionPosition.End) return [...currentActions, ...customActions];
      return [...customActions, ...currentActions];
    })
  );

  return {
    ...observables,
    actionDefinitions: actions
  };
};
