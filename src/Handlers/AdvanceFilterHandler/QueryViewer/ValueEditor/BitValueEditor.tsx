import { Checkbox } from "@material-ui/core";
import * as React from "react";
import { useForceUpdate } from "../../../../Utils/useForceUpdate";
import { ExpressionModel } from "../ExpressionModel";

type Props = {
  expression: ExpressionModel;
};

export function BitValueEditor(props: Props) {
  const forceUpdate = useForceUpdate();

  React.useEffect(() => {
    // handle null values
    props.expression.value = props.expression.value == null ? true : props.expression.value;
  }, [props.expression]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    props.expression.value = checked;
    forceUpdate();
  };
  return (
    <Checkbox
      color={"primary"}
      style={{ padding: 0 }}
      checked={props.expression.value === true}
      onChange={handleChange}
    />
  );
}
