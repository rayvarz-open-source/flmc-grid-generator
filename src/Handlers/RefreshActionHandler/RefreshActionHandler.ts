import { map } from "rxjs/operators";
import { Localization } from "../../Models/Localization";
import { GridCommands } from "../CommandHandler/Commands";
import { Handler } from "../Handlers";
import { combineLatest } from "rxjs";

export const refreshActionHandler: Handler = (props, observables) => {
  let localization: Localization;

  props.options.localization.subscribe(v => (localization = v));

  const actions = combineLatest(observables.actionDefinitions, props.options.noRefresh).pipe(
    map(([actions, isNoRefresh]) => {
      if (isNoRefresh)
        return actions;
      return [
        ...actions,
        {
          icon: "refresh",
          isFreeAction: true,
          tooltip: localization.refresh,
          onClick: (event: any, data: any) => props.controllers.commandController.next(GridCommands.refresh)
        }
      ];
    })
  );

  return {
    ...observables,
    actionDefinitions: actions
  };
};
