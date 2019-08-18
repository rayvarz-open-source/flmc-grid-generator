import { map } from "rxjs/operators";
import { Localization } from "../../Models/Localization";
import { GridCommands } from "../CommandHandler/Commands";
import { Handler } from "../Handlers";

export const refreshActionHandler: Handler = (props, observables) => {
  let localization: Localization;

  props.options.localization.subscribe(v => (localization = v));

  const actions = observables.actionDefinitions.pipe(
    map(v => {
      return [
        ...v,
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
