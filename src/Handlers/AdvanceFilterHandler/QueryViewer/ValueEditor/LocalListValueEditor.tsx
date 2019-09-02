import { Menu, MenuItem } from "@material-ui/core";
import * as React from "react";
import { useForceUpdate } from "../../../../Utils/useForceUpdate";
import { ExpressionModel } from "../ExpressionModel";
import { ValueContainerView } from "../ValueContainerView";

type Props = {
  expression: ExpressionModel;
};

export function LocalListValueEditor(props: Props) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const source = props.expression.extras.field.type.source!;

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(event.currentTarget);
  }
  function handleClose() {
    setAnchorEl(null);
  }

  function handleItemClick(value: any, index: number) {
    handleClose();
    props.expression.value = source.values[index][source.keyFieldName];
    forceUpdate();
  }

  const forceUpdate = useForceUpdate();

  React.useEffect(() => {
    // handle null values
    props.expression.value =
      props.expression.value == null ? source.values[0][source.keyFieldName] : props.expression.value;
  }, [props.expression]);

  const displayValue = source.values.find(v => v[source.keyFieldName] === props.expression.value);

  return (
    <>
      <ValueContainerView
        value={displayValue == null ? " - " : displayValue[source.valueFieldName]}
        onClick={handleClick}
      />
      <Menu
        id={`value_editor_${props.expression.fieldName}_${props.expression.path}`}
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {source.values.map((item, i) => (
          <MenuItem
            key={item[source.keyFieldName]}
            value={item[source.keyFieldName]}
            onClick={e => handleItemClick(e, i)}
          >
            {item[source.valueFieldName]}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
