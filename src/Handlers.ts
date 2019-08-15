import { BaseProps } from "@material-ui/core/OverridableComponent";
import { AttributeObservables } from "./BaseGridGenerator";

export type Handler = (props: BaseProps<any>, observables: AttributeObservables) => AttributeObservables;

export const handlers: Handler[] = [];
