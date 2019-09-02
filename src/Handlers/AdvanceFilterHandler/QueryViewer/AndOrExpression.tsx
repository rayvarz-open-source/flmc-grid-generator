import { Icon, IconButton, Typography } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import * as React from "react";
import { FilterSchemaType } from "../../../Models/Filter";
import { useIsRtl } from "../../../Utils/useIsRtl";
import { AdvanceFilterContext } from "../AdvanceFilterContext";
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
    },
    deleteButton: {
      padding: 0,
      transition: "100ms"
    },
    startContainer: {
      flexDirection: "row",
      display: "flex",
      alignItems: "center"
    }
  })
);
type AndOrExpressionProps = {
  expression: ExpressionModel;
  depth: number;
};
export function AndOrExpression(props: AndOrExpressionProps) {
  const isRtl = useIsRtl();
  const { expression } = props;
  const advanceFilterContext = React.useContext(AdvanceFilterContext);
  const operatorName =
    expression.type === FilterSchemaType.AND
      ? advanceFilterContext.contentProps!.localization.and
      : advanceFilterContext.contentProps!.localization.or;
  const subExpressions = expression.value as ExpressionModel[];
  const classes = useAndOrStyles();
  const [hoverOverBrackets, setHoverOverBrackets] = React.useState(false);

  const createKeyword = (value: string, variant: string = "h6") => (
    <Typography variant={variant as any} className={classes.keyword} style={{ opacity: hoverOverBrackets ? 1.0 : 0.5 }}>
      {value}
    </Typography>
  );

  const _path = props.expression.path.join("-");
  const isRoot = props.expression.path.length === 1;

  const elementChild = (depth: number) => (
    <>
      {/* {props.expression.path.length !== 1 && <DropZone id={`before#${_path}`} />} */}
      <div className={classes.startContainer}>
        {createKeyword(advanceFilterContext.contentProps!.localization.openBracket)}
        {!isRoot && (
          <IconButton
            onClick={() => advanceFilterContext.onDelete(props.expression.path)}
            className={classes.deleteButton}
            style={{
              opacity: hoverOverBrackets ? 0.7 : 0.0,
              transitionDelay: hoverOverBrackets ? "150ms" : "0ms",
              width: hoverOverBrackets ? "1rem" : "0rem",
              height: hoverOverBrackets ? "1rem" : "0rem",
              marginRight: isRtl ? 0 : ( hoverOverBrackets ? 3 : 0),
              marginLeft: isRtl ? ( hoverOverBrackets ? 3 : 0)  : 0
            }}
          >
            <Icon style={{ fontSize: "1rem" }}>{"close"}</Icon>
          </IconButton>
        )}
      </div>
      {subExpressions.map((exp, i) => (
        <React.Fragment key={`${exp.fieldName}_${i}`}>
          <Expression depth={0} expression={exp} />
          {i !== subExpressions.length - 1 && createKeyword(operatorName, "body2")}
        </React.Fragment>
      ))}
      <DropZone id={`inner#${_path}`} />
      {createKeyword(advanceFilterContext.contentProps!.localization.closeBracket)}
      {/* {props.expression.path.length !== 1 && <DropZone id={`after#${_path}`} />} */}
    </>
  );

  let element: React.ReactNode;
  if (calculateExpressionDepth(expression) < 4) {
    element = <div style={{ flexDirection: "row", display: "flex", alignItems: "center" }}>{elementChild(0)}</div>;
  } else {
    element = <div style={{ flexDirection: "column", display: "flex" }}>{elementChild(props.depth + 1)}</div>;
  }
  return (
    <div
      onMouseEnter={() => setHoverOverBrackets(true)}
      onMouseLeave={() => setHoverOverBrackets(false)}
      style={{
        marginLeft: isRtl ? 0 : 15,
        marginRight: isRtl ? 15 : 0,
        backgroundColor: hoverOverBrackets ? "rgba(0,0,0,0.03)" : "rgba(0,0,0,0)",
        borderRadius: 10,
        padding: 3
      }}
    >
      {element}
    </div>
  );
}

function calculateExpressionDepth(expression: ExpressionModel): number {
  if (!Array.isArray(expression.value)) return 0;
  let depth = expression.value.length;
  let childrenDepths = expression.value.map(v => calculateExpressionDepth(v));
  return depth + Math.max(...childrenDepths);
}
