
import * as React from "react";
import { FilterSchemaType } from "../../../Models/Filter";
import { AndOrExpression } from "./AndOrExpression";
import { ExpressionModel } from "./ExpressionModel";
import { FilterExpressionView } from "./FilterExpressionView";
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

type ExpressionProps = {
  expression: ExpressionModel;
  depth: number;
};
export function Expression(props: ExpressionProps) {
  
  const { expression, ...others } = props;

  if ([FilterSchemaType.AND, FilterSchemaType.OR].includes(expression.type)) {
    return <AndOrExpression depth={props.depth} expression={expression} {...others} />;
  } else {
    return <FilterExpressionView depth={props.depth} expression={expression} />
  }
}
