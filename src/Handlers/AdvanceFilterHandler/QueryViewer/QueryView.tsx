import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import * as React from "react";
import { ExpressionModel } from "./ExpressionModel";
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
      userSelect: "none",
      "&::-webkit-scrollbar-track": {
        borderRadius: 10,
        backgroundColor: "#f3f3f3"
      },
      "&::-webkit-scrollbar": {
        width: 4,
        backgroundColor: "#F5F5F5"
      },
      "&::-webkit-scrollbar-thumb": {
        borderRadius: 10,
        backgroundColor: theme.palette.primary.main,
        opacity: 0.4
      }
    }
  })
);

type Props = {
  query: ExpressionModel;
};

export function QueryView(props: Props) {
  const classes = useQueryViewStyle();

  return (
    <div className={classes.container}>
      <Expression depth={0} expression={props.query} />
    </div>
  );
}
