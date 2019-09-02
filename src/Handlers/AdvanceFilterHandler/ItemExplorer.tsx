import { ButtonBase, Icon, TextField, Typography } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import * as React from "react";
import { MutableRefObject } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";

export type ItemModel = {
  title: string;
  icon: string;
  id: number;
};

export type CategoryType = {
  children: ItemModel[];
  title: string;
};

//region Item
type ItemProps = {
  item: ItemModel;
};

const useItemStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: "flex",
      padding: 3,
      paddingLeft: 5,
      paddingRight: 5,
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: "rgba(244,244,244,1)",
      "&:hover": {
        backgroundColor: "rgba(0,0,0,0.1)"
      }
    },
    titleContainer: {
      alignItems: "center",
      display: "flex",
      flexDirection: "row"
    },
    label: {
      color: theme.palette.text.primary,
      fontSize: 14,
      display: "inline-block",
      marginLeft: 5,
      verticalAlign: "middle",
      WebkitTouchCallout: "none",
      userSelect: "none"
    },
    icon: {
      color: "rgba(0,0,0,0.19)"
    },
    prefixIcon: {
      color: "rgba(0,0,0,0.19)",
      fontSize: "1.2rem"
    }
  })
);

function getNoAnimationStyle(style, snapshot) {
  if (!snapshot.isDropAnimating) {
    return style;
  }
  return {
    ...style,
    // cannot be 0, but make it super tiny
    transitionDuration: `0.001s`
  };
}

function Item(props: ItemProps) {
  const classes = useItemStyles();
  const [hover, setHover] = React.useState(false);

  const createChild = (provided: any, snapshot: any, isClone: boolean = false) => (
    <div
      ref={isClone ? undefined : provided.innerRef}
      {...(isClone ? {} : provided.draggableProps)}
      {...(isClone ? {} : provided.dragHandleProps)}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
      className={classes.container}
      style={getNoAnimationStyle(provided.draggableProps.style, snapshot)}
    >
      <div className={classes.titleContainer}>
        <Icon className={classes.prefixIcon}>{props.item.icon}</Icon>
        <Typography className={classes.label}>{props.item.title}</Typography>
      </div>
      <Icon style={{ opacity: hover ? 1 : 0 }} className={classes.icon}>
        {"add"}
      </Icon>
    </div>
  );

  return (
    <Draggable key={props.item.id + "dKey"} draggableId={props.item.id + "dId"} index={props.item.id}>
      {(provided, snapshot) => (
        <React.Fragment>
          {createChild(provided, snapshot)}
          {snapshot.isDragging && (
            <div style={{ display: "none!important", transform: "none!important" }}>
              {createChild(provided, snapshot, true)}
            </div>
          )}
        </React.Fragment>
      )}
    </Draggable>
  );
}
//endregion

//region Item Header
type CategoryItemProps = {
  item: CategoryType;
};
const useItemHeaderStyles = makeStyles((theme: Theme) =>
  createStyles({
    label: {
      color: theme.palette.primary.contrastText,
      fontSize: 14,
      display: "inline-block",
      marginLeft: 5,
      verticalAlign: "middle",
      cursor: "default",
      WebkitTouchCallout: "none",
      userSelect: "none"
    },
    icon: {
      display: "inline-block",
      verticalAlign: "middle",
      marginTop: 1,
      color: theme.palette.primary.contrastText
      // transition: "200ms"
    },
    container: {
      backgroundColor: theme.palette.primary.main,
      padding: 3,
      paddingLeft: 5,
      // transition: "200ms",
      "&:hover": {
        backgroundColor: theme.palette.primary.dark
      }
    },
    rippleStyle: {
      width: "100%",
      height: "100%",
      justifyContent: "start"
    }
  })
);

function ItemHeader(props: CategoryItemProps) {
  const classes = useItemHeaderStyles();
  const [open, setOpen] = React.useState(true);

  return (
    <>
      <div onClick={() => setOpen(!open)} className={classes.container}>
        <ButtonBase className={classes.rippleStyle}>
          <Icon style={{ transform: `rotate(${open ? 90 : 0}deg)` }} className={classes.icon}>
            {"keyboard_arrow_right"}
          </Icon>
          <Typography className={classes.label}>{props.item.title}</Typography>
        </ButtonBase>
      </div>

      {open && (
        <Droppable isDropDisabled={true} droppableId="sourceDroppable">
          {(provided, snapshot) => (
            <div ref={provided.innerRef}>
              {props.item.children.map((item, i) => (
                <Item item={item} key={`key_${i}`} />
              ))}
              <div style={{ display: "none" }}>{provided.placeholder}</div>
            </div>
          )}
        </Droppable>
      )}
    </>
  );
}
//endregion

// search
const useSearchStyles = makeStyles((theme: Theme) =>
  createStyles({
    box: {
      width: "100%",
      height: 30
    }
  })
);

type SearchProps = {
  value: string;
  onChange: (value: string) => void;
  inputRef: MutableRefObject<any>;
};

function Search(props: SearchProps) {
  const classes = useSearchStyles();
  return (
    <TextField
      className={classes.box}
      value={props.value}
      onChange={v => props.onChange(v.target.value)}
      variant={"filled"}
      placeholder={'Press "/" to search...'}
      inputRef={props.inputRef}
      inputProps={{
        style: {
          height: 30,
          padding: "0 14px"
        }
      }}
    />
  );
}

// end search

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    itemExplorer: {
      flex: 2,
      backgroundColor: "rgba(0,0,0,0.05)",
      overflow: "scroll",
      overflowX: "hidden",
      "&::-webkit-scrollbar-track": {
        borderRadius: 10,
        backgroundColor: "#f3f3f3"
      },
      "&::-webkit-scrollbar": {
        width: 2.5,
        backgroundColor: "#F5F5F5"
      },
      "&::-webkit-scrollbar-thumb": {
        borderRadius: 10,
        backgroundColor: "#c3c3c3"
      }
    }
  })
);

type Props = {
  categories: CategoryType[];
};

export default function ItemExplorer(props: Props) {
  const classes = useStyles();
  const [value, setValue] = React.useState("");
  const inputRef = React.useRef<any>(null);

  React.useEffect(() => {
    const eventHandler = (e: KeyboardEvent) => {
      if (e.key !== "/" || inputRef.current == null) return;
      inputRef.current.focus();
      setTimeout(() => setValue(""), 0)
    };
    window.addEventListener("keydown", eventHandler);

    return () => window.removeEventListener("keydown", eventHandler);
  }, []);

  const filteredItems = React.useMemo(
    () =>
      props.categories.map(category => {
        return {
          ...category,
          children: category.children.filter(v => v.title.toLowerCase().includes(value.toLowerCase()))
        };
      }),
    [value, props.categories]
  );

  return (
    <div className={classes.itemExplorer}>
      <Search inputRef={inputRef} value={value} onChange={v => setValue(v)} />
      {filteredItems.map((item, i) => (
        <ItemHeader item={item} key={`category_${i}`} />
      ))}
    </div>
  );
}
