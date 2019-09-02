import { Typography } from "@material-ui/core";
import * as React from "react";
import { FieldShemaTypeName } from "../../../../Models/Field";
import { ExpressionModel } from "../ExpressionModel";
import { BitValueEditor } from "./BitValueEditor";
import { InputValueEditor } from "./InputValueEditor";

type Props = {
  expression: ExpressionModel;
};

export function ValueEditor(props: Props) {
  switch (props.expression.extras.field.type.name) {
    case FieldShemaTypeName.Bit:
      return <BitValueEditor expression={props.expression} />;
    case FieldShemaTypeName.Barcode:
      return <InputValueEditor expression={props.expression} type={"text"} />;
    case FieldShemaTypeName.GregorianDateTime:
      return null;
    case FieldShemaTypeName.PersianDate:
      return null;
    case FieldShemaTypeName.String:
      return <InputValueEditor expression={props.expression} type={"text"} />;
    case FieldShemaTypeName.Money:
      return <InputValueEditor expression={props.expression} type={"number"} />;
    case FieldShemaTypeName.List:
      return null;
    case FieldShemaTypeName.LocalList:
      return null;
    case FieldShemaTypeName.Int:
      return <InputValueEditor expression={props.expression} type={"number"} />;
    default:
      return <Typography variant="body2">{" ? "}</Typography>;
  }
}
