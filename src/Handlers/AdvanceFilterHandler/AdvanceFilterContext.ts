import * as React from "react";
import { AdvanceFilterContentProps } from "./AdvanceFilterView";
import { ExpressionModel } from "./QueryViewer/ExpressionModel";

type Props = {
  isDragging: boolean;
  onDropped: (value: string) => void;
  onDelete: (path: number[]) => void;
  contentProps?: AdvanceFilterContentProps;
  rootExpression?: ExpressionModel
};

export const AdvanceFilterContext = React.createContext<Props>({
  isDragging: false,
  onDropped: (value: string) => {},
  onDelete: (path: number[]) => {},
});
