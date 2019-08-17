import { filter } from "rxjs/operators";
import { Handler } from "../Handlers";
import { GridCommandName } from "./Commands";

export const commandHandler: Handler = (props, observables) => {
  props.controllers.commandController
    .pipe(filter(command => command.name !== GridCommandName.Nop))
    .subscribe(command => {
      switch (command.name) {
        case GridCommandName.RefreshCurrentPage:
          props.elements.grid.tableRef && props.elements.grid.tableRef.onQueryChange();
          break;
        case GridCommandName.SetCurrentPage:
          props.elements.grid.tableRef && props.elements.grid.tableRef.onChangePage(null, parseInt(command.param || 0));
          break;
      }
    });

  return {
    ...observables
  };
};
