import { Icon } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import * as React from "react";
//
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      backgroundColor: "rgba(0,0,0,0.3)",
      opacity: 0.3,
      padding: 3,
      width: 25,
      height: 25,
      transition: "300ms",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      margin: 5,
      borderRadius: 5
    }
  })
);
type Props = {
  id: string;
};

export function DropZone(props: Props) {
  const classes = useStyles();

  return (
    <div id={props.id} className={classes.container}>
      <Icon>{"keyboard_arrow_down"}</Icon>
    </div>
  );
}
