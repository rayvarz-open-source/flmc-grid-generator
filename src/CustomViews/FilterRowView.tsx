/* eslint-disable no-unused-vars */
import { FormControlLabel, Tooltip } from "@material-ui/core";
import Checkbox from "@material-ui/core/Checkbox";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import TextField from "@material-ui/core/TextField";
import { DatePicker, DateTimePicker, MuiPickersUtilsProvider, TimePicker } from "@material-ui/pickers";
import * as React from "react";
import { FieldSchema, FieldShemaTypeName } from "../GridResultModel";
import jMoment from "moment-jalaali";
import JalaliUtils from "@date-io/jalaali";
import MomentUtils from "@date-io/moment";
import moment = require("moment");

jMoment.loadPersian({ dialect: "persian-modern", usePersianDigits: false });

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
};

const defaultProps = {
  emptyCell: false,
  columns: [],
  selection: false,
  hasActions: false,
  localization: {
    filterTooltip: "Filter"
  }
};

type Props = {
  emptyCell: boolean;
  columns: any[];
  hasDetailPanel: boolean;
  isTreeData: boolean;
  onFilterChanged: (id: number, targetValue: any) => void;
  filterCellStyle: any;
  selection: boolean;
  actionsColumnIndex?: number;
  hasActions?: boolean;
  localization?: any;
};

class CustomFilterRowView extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  renderLookupFilter = columnDef => (
    <FormControl style={{ width: "100%" }}>
      <InputLabel htmlFor="select-multiple-checkbox">{columnDef.filterPlaceholder}</InputLabel>
      <Select
        multiple
        value={columnDef.tableData.filterValue || []}
        onChange={event => {
          this.props.onFilterChanged(columnDef.tableData.id, event.target.value);
        }}
        input={<Input id="select-multiple-checkbox" />}
        renderValue={selecteds => (selecteds as any).map(selected => columnDef.lookup[selected]).join(", ")}
        MenuProps={MenuProps}
      >
        {Object.keys(columnDef.lookup).map(key => (
          <MenuItem key={key} value={key}>
            <Checkbox
              checked={
                columnDef.tableData.filterValue ? columnDef.tableData.filterValue.indexOf(key.toString()) > -1 : false
              }
            />
            <ListItemText primary={columnDef.lookup[key]} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  renderBooleanFilter = columnDef => (
    <FormControlLabel
      control={
        <Checkbox
          indeterminate={columnDef.tableData.filterValue === undefined}
          checked={columnDef.tableData.filterValue === "checked"}
          onChange={() => {
            let val;
            if (columnDef.tableData.filterValue === undefined) {
              val = "checked";
            } else if (columnDef.tableData.filterValue === "checked") {
              val = "unchecked";
            }
            this.props.onFilterChanged(columnDef.tableData.id, val);
          }}
        />
      }
      label={columnDef.fieldDefinition.fieldName}
    />
  );

  renderDefaultFilter = columnDef => {
    if (columnDef.filter == null) return;
    const fieldType = columnDef.fieldDefinition.type.name;

    const isNumeric = fieldType === FieldShemaTypeName.Money || fieldType === FieldShemaTypeName.Int;
    return (
      <Tooltip title={columnDef.filter.filterName || ""}>
        <TextField
          placeholder={"Y"}
          style={isNumeric ? { float: "right" } : {}}
          type={isNumeric ? "number" : "text"}
          value={columnDef.tableData.filterValue || ""}
          onChange={event => {
            this.props.onFilterChanged(columnDef.tableData.id, event.target.value);
          }}
        />
      </Tooltip>
    );
  };

  renderDateTypeFilter = columnDef => {
    if (columnDef.filter == null) return;
    let field: FieldSchema = columnDef.fieldDefinition;
    const onDateInputChange = date => this.props.onFilterChanged(columnDef.tableData.id, date);

    let value = columnDef.tableData.filterValue || null;

    return (
      <MuiPickersUtilsProvider
        utils={field.type.name === FieldShemaTypeName.GregorianDateTime ? MomentUtils : JalaliUtils}
      >
        <Tooltip title={columnDef.filter.filterName || ""}>
          <DatePicker
            format={field.type.name === FieldShemaTypeName.GregorianDateTime ? "YYYY/MM/DD" : "jYYYY/jM/jD"}
            style={{ minWidth: 80 }}
            value={value}
            onChange={onDateInputChange}
            clearable
          />
        </Tooltip>
      </MuiPickersUtilsProvider>
    );
  };

  getComponentForColumn(columnDef) {
    // if (columnDef.filter == null) return null;
    let field: FieldSchema = columnDef.fieldDefinition;
    if (columnDef.filtering === false) {
      return null;
    }

    switch (field.type.name) {
      case FieldShemaTypeName.Bit:
        return this.renderBooleanFilter(columnDef);
      case FieldShemaTypeName.GregorianDateTime:
        return this.renderDateTypeFilter(columnDef);
      case FieldShemaTypeName.PersianDate:
        return this.renderDateTypeFilter(columnDef);
      default:
        return this.renderDefaultFilter(columnDef);
    }
  }

  render() {
    const columns = this.props.columns
      .filter(columnDef => !columnDef.hidden && !(columnDef.tableData.groupOrder > -1))
      .sort((a, b) => a.tableData.columnOrder - b.tableData.columnOrder)
      .map(columnDef => (
        <TableCell key={columnDef.tableData.id} style={{ ...this.props.filterCellStyle, ...columnDef.filterCellStyle }}>
          {this.getComponentForColumn(columnDef)}
        </TableCell>
      ));

    if (this.props.selection) {
      columns.splice(0, 0, <TableCell padding="none" key="key-selection-column" />);
    }

    if (this.props.emptyCell && this.props.hasActions) {
      if (this.props.actionsColumnIndex === -1) {
        columns.push(<TableCell key="key-action-column" />);
      } else {
        let endPos = 0;
        if (this.props.selection) {
          endPos = 1;
        }
        columns.splice((this.props.actionsColumnIndex || 0) + endPos, 0, <TableCell key="key-action-column" />);
      }
    }

    if (this.props.hasDetailPanel) {
      columns.splice(0, 0, <TableCell padding="none" key="key-detail-panel-column" />);
    }

    if (this.props.isTreeData === true) {
      columns.splice(0, 0, <TableCell padding="none" key={"key-tree-data-filter"} />);
    }

    this.props.columns
      .filter(columnDef => columnDef.tableData.groupOrder > -1)
      .forEach(columnDef => {
        columns.splice(0, 0, <TableCell padding="checkbox" key={"key-group-filter" + columnDef.tableData.id} />);
      });

    return <TableRow style={{ height: 10 }}>{columns}</TableRow>;
  }
}

export default CustomFilterRowView;
