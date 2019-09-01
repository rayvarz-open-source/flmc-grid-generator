import { ButtonBase, Icon, IconButton, Menu, MenuItem, Typography } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import * as React from "react";
import { Filter, FilterSchemaType, getFilterSchemaTypeName } from "../../Models/Filter";

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

function AndOrExpression(props: AndOrExpressionProps) {
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

//

const useValueContainer = makeStyles((theme: Theme) =>
  createStyles({
    valueContainer: {
      backgroundColor: "rgba(0,0,0,0.09)",
      paddingLeft: 5,
      paddingRight: 5,
      marginLeft: 5,
      marginRight: 5,
      transition: "300ms",
      "&:hover": {
        paddingRight: 20
      }
    },
    editIcon: {
      fontSize: "1rem",
      position: "absolute",
      right: 3,
      transition: "100ms"
    }
  })
);

type ValueContainerProps = {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  value: string;
};

function ValueContainerView(props: ValueContainerProps) {
  const classes = useValueContainer();
  const [hover, setHover] = React.useState(false);
  return (
    <ButtonBase
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={classes.valueContainer}
    >
      <Typography onClick={props.onClick} variant="body2">
        {props.value}
      </Typography>
      <Icon
        className={classes.editIcon}
        style={{ opacity: hover ? 0.5 : 0.0, transitionDelay: hover ? "150ms" : "0ms" }}
      >
        {"edit"}
      </Icon>
    </ButtonBase>
  );
}

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

function Expression(props: ExpressionProps) {
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

//

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
