import { TextField } from "@material-ui/core";
import * as React from "react";
import { useForceUpdate } from "../../../../Utils/useForceUpdate";
import { ExpressionModel } from "../ExpressionModel";

type Props = {
  expression: ExpressionModel;
  type: "text" | "number";
};

export function InputValueEditor(props: Props) {
  const forceUpdate = useForceUpdate();

  React.useEffect(() => {
    // handle null values
    props.expression.value = props.expression.value == null ? "" : props.expression.value;
  }, [props.expression]);

  const onChange = (value: string) => {
    props.expression.value = value;
    forceUpdate();
  };

  return (
    <TextField
      value={props.expression.value == null ? "" : props.expression.value}
      onChange={v => onChange(v.target.value)}
      variant={"filled"}
      type={props.type}
      inputProps={{
        style: {
          height: 20,
          maxWidth: 100,
          padding: "0 14px"
        }
      }}
    />
  );
}
