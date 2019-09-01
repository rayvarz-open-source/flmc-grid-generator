import { Icon, TextField, Typography } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import * as React from "react";

export type ItemModel = {
  title: string;
  icon: string;
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
      cursor: "default",
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

function Item(props: ItemProps) {
  const classes = useItemStyles();
  const [hover, setHover] = React.useState(false);

  return (
    <div onMouseOver={() => setHover(true)} onMouseOut={() => setHover(false)} className={classes.container}>
      <div className={classes.titleContainer}>
        <Icon className={classes.prefixIcon}>
          {props.item.icon}
        </Icon>
        <Typography className={classes.label}>{props.item.title}</Typography>
      </div>
      <Icon style={{ opacity: hover ? 1 : 0 }} className={classes.icon}>
        {"add"}
      </Icon>
    </div>
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
      color: theme.palette.primary.contrastText,
      transition: "200ms"
    },
    container: {
      backgroundColor: theme.palette.primary.main,
      padding: 3,
      paddingLeft: 5,
      transition: "200ms",
      "&:hover": {
        backgroundColor: theme.palette.primary.dark
      }
    }
  })
);

function ItemHeader(props: CategoryItemProps) {
  const classes = useItemHeaderStyles();
  const [open, setOpen] = React.useState(true);

  return (
    <>
      <div onClick={() => setOpen(!open)} className={classes.container}>
        <Icon style={{ transform: `rotate(${open ? 90 : 0}deg)` }} className={classes.icon}>
          {"keyboard_arrow_right"}
        </Icon>
        <Typography className={classes.label}>{props.item.title}</Typography>
      </div>
      {open && props.item.children.map((item, i) => <Item item={item} key={`key_${i}`} />)}
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
};

function Search(props: SearchProps) {
  const classes = useSearchStyles();

  return (
    <TextField
      className={classes.box}
      value={props.value}
      onChange={v => props.onChange(v.target.value)}
      variant={"filled"}
      placeholder="Search..."
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
      <Search value={value} onChange={v => setValue(v)} />
      {filteredItems.map((item, i) => (
        <ItemHeader item={item} key={`category_${i}`} />
      ))}
    </div>
  );
}
