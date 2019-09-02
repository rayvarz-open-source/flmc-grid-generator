import { Theme } from "@material-ui/core/styles/createMuiTheme";
import { useTheme } from "@material-ui/styles";
export function useIsRtl() {
  const theme = useTheme<Theme>();
  return theme == null ? false : theme.direction == "rtl";
}
