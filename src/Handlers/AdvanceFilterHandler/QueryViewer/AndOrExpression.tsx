import { Typography } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import * as React from "react";
import { FilterSchemaType } from "../../../Models/Filter";
import { DropZone } from "./DropZone";
import { ExpressionModel } from "./ExpressionModel";
import { Expression } from "./ExpressionView";

const useAndOrStyles = makeStyles((theme: Theme) =>
  createStyles({
    keyword: {
      fontWeight: "bold",
      transition: "200ms",
      marginLeft: 5,
      marginRight: 5
    }
  })
);
type AndOrExpressionProps = {
  expression: ExpressionModel;
  depth: number;
};
export function AndOrExpression(props: AndOrExpressionProps) {
  const { expression } = props;
  const operatorName = expression.type === FilterSchemaType.AND ? "And" : "Or";
  const subExpressions = expression.value as ExpressionModel[];
  const classes = useAndOrStyles();
  const [hoverOverBrackets, setHoverOverBrackets] = React.useState(false);

  const createKeyword = (value: string, variant: string = "h6") => (
    <Typography
      variant={variant as any}
      className={classes.keyword}
      style={{ opacity: hoverOverBrackets ? 1.0 : 0.5 }}
      onMouseEnter={() => setHoverOverBrackets(true)}
      onMouseLeave={() => setHoverOverBrackets(false)}
    >
      {value}
    </Typography>
  );

  const _path = props.expression.path.join("-");

  const elementChild = (depth: number) => (
    <>
      {/* {props.expression.path.length !== 1 && <DropZone id={`before#${_path}`} />} */}
      {createKeyword("(")}
      {subExpressions.map((exp, i) => (
        <React.Fragment key={`${exp.fieldName}_${i}`}>
          <Expression depth={0} expression={exp} />
          {i !== subExpressions.length - 1 && createKeyword(operatorName, "body2")}
        </React.Fragment>
      ))}
      <DropZone id={`inner#${_path}`} />
      {createKeyword(")")}
      {/* {props.expression.path.length !== 1 && <DropZone id={`after#${_path}`} />} */}
    </>
  );

  let element: React.ReactNode;
  if (calculateExpressionDepth(expression) < 4) {
    element = <div style={{ flexDirection: "row", display: "flex", alignItems: "center" }}>{elementChild(0)}</div>;
  } else {
    element = <div style={{ flexDirection: "column", display: "flex" }}>{elementChild(props.depth + 1)}</div>;
  }
  return <div style={{ marginLeft: 15 }}>{element}</div>;
}

function calculateExpressionDepth(expression: ExpressionModel): number {
  if (!Array.isArray(expression.value)) return 0;
  let depth = expression.value.length;
  let childrenDepths = expression.value.map(v => calculateExpressionDepth(v));
  return depth + Math.max(...childrenDepths);
}
