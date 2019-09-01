import { Typography } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import * as React from "react";
import { Filter, FilterSchemaType } from "../../../Models/Filter";
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
  expression: Filter;
  depth: number;
};
export function AndOrExpression(props: AndOrExpressionProps) {
  const { expression } = props;
  const operatorName = expression.type === FilterSchemaType.AND ? "And" : "Or";
  const subExpressions = expression.value as Filter[];
  const classes = useAndOrStyles();
  const [hoverOverBrackets, setHoverOverBrackets] = React.useState(false);
  function createKeyword(value: string, variant: string = "h6") {
    return (
      <Typography
        variant={variant as any}
        className={classes.keyword}
        style={{ opacity: hoverOverBrackets ? 0.8 : 0.5 }}
        onMouseEnter={() => setHoverOverBrackets(true)}
        onMouseLeave={() => setHoverOverBrackets(false)}
      >
        {value}
      </Typography>
    );
  }
  let element: React.ReactNode;
  if (subExpressions.length < 3) {
    element = (
      <div style={{ flexDirection: "row", display: "flex", alignItems: "center" }}>
        {createKeyword("(")}
        {subExpressions.map((exp, i) => (
          <React.Fragment key={`${exp.fieldName}_${i}`}>
            <Expression depth={0} expression={exp} />
            {i !== subExpressions.length - 1 && createKeyword(operatorName, "body2")}
          </React.Fragment>
        ))}
        {createKeyword(")")}
      </div>
    );
  } else {
    element = (
      <div style={{ flexDirection: "column", display: "flex" }}>
        {createKeyword("(")}
        {subExpressions.map((exp, i) => (
          <React.Fragment key={`${exp.fieldName}_${i}`}>
            <Expression depth={props.depth + 1} expression={exp} />
            {i !== subExpressions.length - 1 && createKeyword(operatorName, "body2")}
          </React.Fragment>
        ))}
        {createKeyword(")")}
      </div>
    );
  }
  return <div style={{ marginLeft: 15 }}>{element}</div>;
}
