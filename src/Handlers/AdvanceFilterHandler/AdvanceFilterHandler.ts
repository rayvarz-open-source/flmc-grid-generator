import { map } from "rxjs/operators";
import { Localization } from "../../Models/Localization";
import { GridCommands } from "../CommandHandler/Commands";
import { Handler } from "../Handlers";

export const advanceFilterHandler: Handler = (props, observables) => {
  if (typeof props.dataSource !== "function") return observables;

  let localization: Localization;

  props.options.localization.subscribe(v => (localization = v));

  const openAdvanceFilter = () => {
    props.controllers.advanceFilterContentPropsController.next({
      currentFilters: JSON.parse(JSON.stringify(props.controllers.advanceFiltersController.value)), // copy current filters
      schema: props.controllers.schemaController.value,
      localization: localization!.advanceFilter,
      onApply: filters => {
        props.controllers.advanceFiltersController.next(filters);
        props.controllers.advanceFilterOpenController.next(false);
        props.controllers.commandController.next(GridCommands.setCurrentPage(0));
        props.controllers.commandController.next(GridCommands.refresh);
      },
      onCancel: () => props.controllers.advanceFilterOpenController.next(false)
    });
    props.controllers.advanceFilterOpenController.next(true);
  };

  const actions = observables.actionDefinitions.pipe(
    map(v => {
      return [
        ...v,
        {
          icon: "filter_list",
          isFreeAction: true,
          tooltip: localization.advanceFilter.actionTooltip,
          onClick: (event: any, data: any) => openAdvanceFilter()
        }
      ];
    })
  );

  return {
    ...observables,
    actionDefinitions: actions
  };
};
