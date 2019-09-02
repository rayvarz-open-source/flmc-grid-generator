import JalaliUtils from "@date-io/jalaali";
import MomentUtils from "@date-io/moment";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import jMoment from "moment-jalaali";
import * as React from "react";
import { FieldShemaTypeName } from "../../../../Models/Field";
import { useForceUpdate } from "../../../../Utils/useForceUpdate";
import { ExpressionModel } from "../ExpressionModel";

jMoment.loadPersian({ dialect: "persian-modern", usePersianDigits: false });

type Props = {
  expression: ExpressionModel;
};

export function DateValueEditor(props: Props) {
  const forceUpdate = useForceUpdate();

  const [localValue, setLocalValue] = React.useState<Date>(() =>
    props.expression.value == null ? new Date() : new Date(props.expression.value)
  );

  React.useEffect(() => {
    // handle null values
    props.expression.value =
      props.expression.value == null ? new Date().toISOString() : new Date(props.expression.value);
  }, [props.expression]);

  const onDateInputChange = (date: any) => {
    setLocalValue(date._d);
    props.expression.value = date._d.toISOString();
    forceUpdate();
  };

  const styles = { minWidth: 80, maxWidth: 100, height: 20, padding: 0 };
  return (
    <MuiPickersUtilsProvider
      utils={
        props.expression.extras.field.type.name === FieldShemaTypeName.GregorianDateTime ? MomentUtils : JalaliUtils
      }
    >
      <DatePicker
        clearable={false}
        format={
          props.expression.extras.field.type.name === FieldShemaTypeName.GregorianDateTime
            ? "YYYY/MM/DD"
            : "jYYYY/jM/jD"
        }
        style={styles}
        inputVariant={"filled"}
        inputProps={{
          style: styles
        }}
        value={localValue}
        onChange={onDateInputChange}
      />
    </MuiPickersUtilsProvider>
  );
}
