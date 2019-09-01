import { ButtonBase, Icon, IconButton, Menu, MenuItem, Typography } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import * as React from "react";
import { Filter, FilterSchemaType, getFilterSchemaTypeName } from "../../Models/Filter";

type InputSectionProps = {
  isSelected: boolean;
  onClick: () => void;
};

function InputSection(props: InputSectionProps) {
  return (
    <ButtonBase
      onClick={props.onClick}
      style={{ width: 100, height: 50, backgroundColor: props.isSelected ? "blue" : "red" }}
    />
  );
}

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

  return (
    <>
      {createKeyword("(")}
      {subExpressions.map((exp, i) => (
        <React.Fragment key={`${exp.fieldName}_${i}`}>
          <Expression expression={exp} />
          {i !== subExpressions.length - 1 && createKeyword(operatorName, "body2")}
        </React.Fragment>
      ))}
      {createKeyword(")")}
    </>
  );
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
};

function Expression(props: ExpressionProps) {
  const classes = useExpressionStyle();
  const { expression } = props;

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
    return <AndOrExpression expression={expression} />;
  } else {
    return (
      <div className={classes.container} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
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
      overflowX: "hidden",
      flexWrap: "wrap",
      padding: 25,
      alignContent: "baseline",
      alignItems: "baseline",
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
      <Expression expression={props.query} />
    </div>
  );
}
