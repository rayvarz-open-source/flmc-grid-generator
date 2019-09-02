import { Icon, IconButton, Menu, MenuItem, Typography } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import * as React from "react";
import { getFilterSchemaTypeName } from "../../../Models/Filter";
import { useForceUpdate } from "../../../Utils/useForceUpdate";
import { AdvanceFilterContext } from "../AdvanceFilterContext";
import { ExpressionModel } from "./ExpressionModel";
import { ValueContainerView } from "./ValueContainerView";
import { ValueEditor } from "./ValueEditor/ValueEditor";

const useExpressionStyle = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      backgroundColor: "rgba(0,0,0,0.05)",
      padding: 3,
      paddingLeft: 5,
      paddingRight: 5,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      transition: "300ms"
    },
    deleteButton: {
      padding: 0,
      transition: "100ms"
    }
  })
);

type Props = {
  expression: ExpressionModel;
  depth: number;
};

export function FilterExpressionView(props: Props) {
  const classes = useExpressionStyle();
  const { expression } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const forceUpdate = useForceUpdate();

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(event.currentTarget);
  }
  function handleClose() {
    setAnchorEl(null);
  }

  function handleItemClick(value: any, index: number) {
    handleClose();
    props.expression.type = props.expression.extras.filters[index].type;
    forceUpdate();
  }

  const [hover, setHover] = React.useState(false);
  return (
    <AdvanceFilterContext.Consumer>
      {value => (
        <div style={{ display: "flex" }}>
          <div
            className={classes.container}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <Typography variant="body2">{expression.fieldName}</Typography>
            <ValueContainerView value={getFilterSchemaTypeName(expression.type)} onClick={handleClick} />
            <ValueEditor expression={props.expression}/>
            <IconButton
              onClick={() => value.onDelete(props.expression.path)}
              className={classes.deleteButton}
              style={{
                opacity: hover ? 0.7 : 0.0,
                transitionDelay: hover ? "150ms" : "0ms",
                width: hover ? "1rem" : "0rem"
              }}
            >
              <Icon style={{ fontSize: "1rem" }}>{"close"}</Icon>
            </IconButton>
            <Menu
              id={`type_select_${expression.fieldName}_${expression.path}`}
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              {props.expression.extras.filters.map((item, i) => (
                <MenuItem key={`option_${i}`} onClick={e => handleItemClick(e, i)} value={item.type}>
                  {getFilterSchemaTypeName(item.type)}
                </MenuItem>
              ))}
            </Menu>
          </div>
        </div>
      )}
    </AdvanceFilterContext.Consumer>
  );
}
