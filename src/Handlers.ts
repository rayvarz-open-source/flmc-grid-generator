import { AttributeObservables, BaseProps, ElementInstances } from "./BaseGridGenerator";
import { commandHandler } from "./CommandHandler/SetupCommandHandler";

export type Handler = (
  props: BaseProps<any> & ElementInstances,
  observables: AttributeObservables
) => AttributeObservables;

export const handlers: Handler[] = [
  commandHandler //
];
