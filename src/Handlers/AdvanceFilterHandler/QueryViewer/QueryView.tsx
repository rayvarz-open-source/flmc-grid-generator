import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import * as React from "react";
import { Filter } from "../../../Models/Filter";
import { Expression } from "./ExpressionView";

const useQueryViewStyle = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      flex: 9,
      display: "flex",
      flexDirection: "row",
      overflow: "auto",
      overflowX: "auto",
      flexWrap: "wrap",
      padding: 25,
      alignContent: "baseline",
      alignItems: "center",
      userSelect: "none"
    }
  })
);

type Props = {
  query: Filter;
};

export function QueryView(props: Props) {
  const classes = useQueryViewStyle();

  return (
    <div className={classes.container}>
      <Expression depth={0} expression={props.query} />
    </div>
  );
}
