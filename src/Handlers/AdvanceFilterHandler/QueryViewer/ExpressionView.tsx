import { Icon, IconButton, Menu, MenuItem, Typography } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import * as React from "react";
import { Filter, FilterSchemaType, getFilterSchemaTypeName } from "../../../Models/Filter";
import { AndOrExpression } from "./AndOrExpression";
import { ValueContainerView } from "./ValueContainerView";
// const useInputSelectionStyles = makeStyles((theme: Theme) =>
//   createStyles({
//     container: {
//       width: "1.1rem",
//       height: "1.1rem",
//       borderRadius: 5,
//       transition: "150ms",
//       backgroundColor: "rgba(0,0,0,0.1)",
//       marginRight: 3,
//       marginLeft: 3,
//       marginBottom: 2
//     },
//     icon: {
//       transition: "150ms"
//     }
//   })
// );
// type InputSectionProps = {
//   isSelected: boolean;
//   onClick: () => void;
// };
// function InputSection(props: InputSectionProps) {
//   const classes = useInputSelectionStyles();
//   return (
//     <ButtonBase className={classes.container} onClick={props.onClick} style={{ opacity: props.isSelected ? 0.5 : 0.3 }}>
//       <Icon className={classes.icon} style={{ opacity: props.isSelected ? 0.5 : 0.3 }}>
//         {"center_focus_strong"}
//       </Icon>
//     </ButtonBase>
//   );
// }
//
//
const useExpressionStyle = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      backgroundColor: "rgba(0,0,0,0.05)",
      padding: 3,
      paddingLeft: 5,
      paddingRight: 5,
      display: "flex",
      flexDirection: "row",
      alignItems: "center"
    },
    deleteButton: {
      padding: 0,
      transition: "100ms"
    }
  })
);
type ExpressionProps = {
  expression: Filter;
  depth: number;
};
export function Expression(props: ExpressionProps) {
  const classes = useExpressionStyle();
  const { expression, ...others } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [hover, setHover] = React.useState(false);
  const filterTypes: FilterSchemaType[] = [FilterSchemaType.EQUAL_BY, FilterSchemaType.LIKE];
  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(event.currentTarget);
  }
  function handleClose() {
    setAnchorEl(null);
  }
  if ([FilterSchemaType.AND, FilterSchemaType.OR].includes(expression.type)) {
    return <AndOrExpression depth={props.depth} expression={expression} {...others} />;
  } else {
    return (
      <div style={{ display: "flex" }}>
        <div
          className={classes.container}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{ marginLeft: props.depth == 0 ? 0 : 15 }}
        >
          <Typography variant="body2">{expression.fieldName}</Typography>
          <ValueContainerView value={getFilterSchemaTypeName(expression.type)} onClick={handleClick} />
          <ValueContainerView value={expression.value || "None"} onClick={handleClick} />
          <IconButton className={classes.deleteButton} style={{ opacity: hover ? 0.7 : 0.2 }}>
            <Icon style={{ fontSize: "1rem" }}>{"close"}</Icon>
          </IconButton>

          <Menu
            id={`type_select_${expression.fieldName}`}
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            {filterTypes.map((item, i) => (
              <MenuItem key={`option_${i}`} onClick={handleClose} value={item}>
                {getFilterSchemaTypeName(item)}
              </MenuItem>
            ))}
          </Menu>
        </div>
      </div>
    );
  }
}
