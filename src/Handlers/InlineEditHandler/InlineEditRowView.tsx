import { Checkbox, TextField } from "@material-ui/core";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import { Action } from "material-table";
import * as React from "react";
import { FieldSchema, FieldShemaTypeName } from "../../Models/Field";

export const byString = (o, s) => {
  if (!s) {
    return;
  }

  s = s.replace(/\[(\w+)\]/g, ".$1"); // convert indexes to properties
  s = s.replace(/^\./, ""); // strip a leading dot
  var a = s.split(".");
  for (var i = 0, n = a.length; i < n; ++i) {
    var x = a[i];
    if (o && x in o) {
      o = o[x];
    } else {
      return;
    }
  }
  return o;
};

export const setByString = (obj, path, value) => {
  var schema = obj; // a moving reference to internal objects within obj

  path = path.replace(/\[(\w+)\]/g, ".$1"); // convert indexes to properties
  path = path.replace(/^\./, ""); // strip a leading dot
  var pList = path.split(".");
  var len = pList.length;
  for (var i = 0; i < len - 1; i++) {
    var elem = pList[i];
    if (!schema[elem]) schema[elem] = {};
    schema = schema[elem];
  }

  schema[pList[len - 1]] = value;
};
type Props = {
  actions?: Action<any>[];
  icons: any;
  index: number;
  data?: object;
  options: any;
  onRowSelected: (...props: any) => any;
  path?: number[];
  columns: any[];
  onRowClick: (...props: any) => any;
  onEditingApproved: (...props: any) => any;
  onEditingCanceled: (...props: any) => any;
  localization: any;
  getFieldValue: (...props: any) => any;
  mode: "add" | "update";
  level: number;
  components: any;
  isTreeData: boolean;
  detailPanel: any;
  onTreeExpandChanged: any;
  onToggleDetailPanel: any;
};

export default class InlineEditRowView extends React.Component<Props, any> {
  constructor(props: Props) {
    super(props);

    this.state = {
      data: props.data ? JSON.parse(JSON.stringify(props.data)) : this.createRowData()
    };
  }

  createRowData() {
    return this.props.columns
      .filter(column => column.initialEditValue && column.field)
      .reduce((prev, column) => {
        prev[column.field] = column.initialEditValue;
        return prev;
      }, {});
  }

  renderColumns() {
    const mapArr = this.props.columns
      .filter(columnDef => !columnDef.hidden && !(columnDef.tableData.groupOrder > -1))
      .sort((a, b) => a.tableData.columnOrder - b.tableData.columnOrder)
      .map((columnDef, index) => {
        const value =
          typeof this.state.data[columnDef.field] !== "undefined"
            ? this.state.data[columnDef.field]
            : byString(this.state.data, columnDef.field);
        const style: any = {};
        if (index === 0) {
          style.paddingLeft = 24 + this.props.level * 20;
        }

        let allowEditing = false;

        if (columnDef.editable === undefined) {
          allowEditing = true;
        }
        if (columnDef.editable === "always") {
          allowEditing = true;
        }
        if (columnDef.editable === "onAdd" && this.props.mode === "add") {
          allowEditing = true;
        }
        if (columnDef.editable === "onUpdate" && this.props.mode === "update") {
          allowEditing = true;
        }
        if (typeof columnDef.editable == "function") {
          allowEditing = columnDef.editable(columnDef, this.props.data);
        }
        if (!columnDef.field || !allowEditing) {
          const readonlyValue = this.props.getFieldValue(this.state.data, columnDef);
          return (
            <this.props.components.Cell
              icons={this.props.icons}
              columnDef={columnDef}
              value={readonlyValue}
              key={columnDef.tableData.id}
              rowData={this.props.data}
            />
          );
        } else {
          const { editComponent, ...cellProps } = columnDef;
          //   const EditComponent = editComponent || this.props.components.EditField;
          return (
            <TableCell
              key={columnDef.tableData.id}
              align={["numeric"].indexOf(columnDef.type) !== -1 ? "right" : "left"}
            >
              {/* <EditComponent
                key={columnDef.tableData.id}
                columnDef={cellProps}
                value={value}
                rowData={this.state.data}
                onChange={value => {
                  const data = { ...this.state.data };
                  setByString(data, columnDef.field, value);
                  // data[columnDef.field] = value;
                  this.setState({ data });
                }}
                onRowDataChange={data => {
                  this.setState({ data });
                }}
              /> */}

              {this.makeEditComponent(
                columnDef.fieldDefinition,
                columnDef.tableData.id,
                value,
                value => {
                  const data = { ...this.state.data };
                  setByString(data, columnDef.field, value);
                  // data[columnDef.field] = value;
                  this.setState({ data });
                },
                data => {
                  this.setState({ data });
                }
              )}
            </TableCell>
          );
        }
      });
    return mapArr;
  }

  makeEditComponent(
    field: FieldSchema,
    key: string,
    value: any,
    onChange: (value: any) => void,
    onRowDataChange: (value: any) => void
  ) {
    if ([FieldShemaTypeName.String, FieldShemaTypeName.String].includes(field.type.name)) {
      return <TextField value={value} key={key} onChange={value => onChange(value)} type={"text"} />;
    } else if ([FieldShemaTypeName.Money, FieldShemaTypeName.Int].includes(field.type.name)) {
      return <TextField value={value} key={key} onChange={value => onChange(value)} type={"number"} />;
    } else if (field.type.name === FieldShemaTypeName.Bit) {
      return (
        <Checkbox
          checked={value == true}
          onChange={(target, value) => {
            onChange(value);
          }}
        />
      );
    } else {
      return null;
    }
  }

  renderActions() {
    const localization = { ...this.props.localization };
    const actions = [
      {
        icon: this.props.icons.Check,
        tooltip: localization.saveTooltip,
        onClick: () => {
          const newData = this.state.data;
          delete newData.tableData;
          this.props.onEditingApproved(this.props.mode, this.state.data, this.props.data);
        }
      },
      {
        icon: this.props.icons.Clear,
        tooltip: localization.cancelTooltip,
        onClick: () => {
          this.props.onEditingCanceled(this.props.mode, this.props.data);
        }
      }
    ];
    return (
      <TableCell padding="none" key="key-actions-column" style={{ width: 42 * actions.length, padding: "0px 5px" }}>
        <div style={{ display: "flex" }}>
          <this.props.components.Actions data={this.props.data} actions={actions} components={this.props.components} />
        </div>
      </TableCell>
    );
  }

  getStyle() {
    const style = {
      // boxShadow: '1px 1px 1px 1px rgba(0,0,0,0.2)',
      borderBottom: "1px solid red"
    };

    return style;
  }

  render() {
    const localization = { ...this.props.localization };

    let columns;
    if (this.props.mode === "add" || this.props.mode === "update") {
      columns = this.renderColumns();
    } else {
      const colSpan = this.props.columns.filter(
        columnDef => !columnDef.hidden && !(columnDef.tableData.groupOrder > -1)
      ).length;
      columns = [
        <TableCell
          padding={this.props.options.actionsColumnIndex === 0 ? "none" : undefined}
          key="key-selection-cell"
          colSpan={colSpan}
        >
          <Typography variant="h6">{localization.deleteText}</Typography>
        </TableCell>
      ];
    }

    if (this.props.options.selection) {
      columns.splice(0, 0, <TableCell padding="none" key="key-selection-cell" />);
    }
    if (this.props.isTreeData) {
      columns.splice(0, 0, <TableCell padding="none" key="key-tree-data-cell" />);
    }

    if (this.props.options.actionsColumnIndex === -1) {
      columns.push(this.renderActions());
    } else if (this.props.options.actionsColumnIndex >= 0) {
      let endPos = 0;
      if (this.props.options.selection) {
        endPos = 1;
      }
      if (this.props.isTreeData) {
        endPos = 1;
        if (this.props.options.selection) {
          columns.splice(1, 1);
        }
      }
      columns.splice(this.props.options.actionsColumnIndex + endPos, 0, this.renderActions());
    }

    // Lastly we add detail panel icon
    // if (this.props.detailPanel) {
    //   const aligment = this.props.options.detailPanelColumnAlignment;
    //   const index = aligment === "left" ? 0 : columns.length;
    //   columns.splice(index, 0, <TableCell padding="none" key="key-detail-panel-cell" />);
    // }

    this.props.columns
      .filter(columnDef => columnDef.tableData.groupOrder > -1)
      .forEach(columnDef => {
        columns.splice(0, 0, <TableCell padding="none" key={"key-group-cell" + columnDef.tableData.id} />);
      });

    const {
      detailPanel,
      isTreeData,
      onRowClick,
      onRowSelected,
      onTreeExpandChanged,
      onToggleDetailPanel,
      onEditingApproved,
      onEditingCanceled,
      getFieldValue,
      ...rowProps
    } = this.props;

    return (
      <>
        <TableRow {...rowProps} style={this.getStyle()}>
          {columns}
        </TableRow>
      </>
    );
  }
}

// InlineEditRowView.defaultProps = {
//   actions: [],
//   index: 0,
//   options: {},
//   path: [],
//   localization: {
//     saveTooltip: 'Save',
//     cancelTooltip: 'Cancel',
//     deleteText: 'Are you sure delete this row?',
//   }
// };
