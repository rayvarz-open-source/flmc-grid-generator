import { Modal } from "@material-ui/core";
import * as React from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { FieldShemaTypeName, FieldType } from "../../Models/Field";
import { Filter, FilterSchemaType } from "../../Models/Filter";
import { Schema } from "../../Models/Schema";
import { AdvanceFilterContext } from "./AdvanceFilterContext";
import ItemExplorer, { CategoryType } from "./ItemExplorer";
import { ExpressionModel } from "./QueryViewer/ExpressionModel";
import { QueryView } from "./QueryViewer/QueryView";

export type Props = {
  currentFilters: Filter[];
  schema: Schema;
};

function createExpressionFromFilter(filter: Filter | ExpressionModel, startPath: number[]): ExpressionModel {
  if ([FilterSchemaType.AND, FilterSchemaType.OR].includes(filter.type)) {
    return {
      ...{
        ...filter,
        value: (filter.value as Filter[]).map((f, i) => {
          let _path = [...startPath, i];
          return {
            ...createExpressionFromFilter(f, _path),
            path: _path
          };
        })
      },
      path: startPath
    };
  } else {
    return {
      ...filter,
      path: startPath
    };
  }
}

function getIconByFieldType(type: FieldType): string {
  switch (type.name) {
    case FieldShemaTypeName.Bit:
      return "check_box";
    case FieldShemaTypeName.GregorianDateTime:
      return "date_range";
    case FieldShemaTypeName.PersianDate:
      return "date_range";
    case FieldShemaTypeName.Image:
      return "image";
    case FieldShemaTypeName.ImageList:
      return "image";
    case FieldShemaTypeName.Int:
      return "exposure_plus_2";
    case FieldShemaTypeName.List:
      return "dehaze";
    case FieldShemaTypeName.LocalList:
      return "dehaze";
    case FieldShemaTypeName.Money:
      return "attach_money";
    case FieldShemaTypeName.Object:
      return "crop_square";
    case FieldShemaTypeName.QRCode:
      return "format_align_justify";
    case FieldShemaTypeName.Barcode:
      return "format_align_justify";
    case FieldShemaTypeName.String:
      return "subtitles";
    default:
      return "crop_square";
  }
}

const DEFAULT_EXPRESSION: ExpressionModel = {
  fieldName: "",
  path: [],
  type: FilterSchemaType.AND,
  value: []
};

const AND_INDEX = -1;
const OR_INDEX = -2;

function getExpressionByPath(source: ExpressionModel, path: number[]): ExpressionModel {
    console.log("start")
  let lastExpression = source;
  for (let index of path.slice(1)) {
    console.log(lastExpression, path, index);
    lastExpression = lastExpression.value[index];
  }
  console.log("end")
  return lastExpression;
}

function insertInnerPath(source: ExpressionModel, expression: ExpressionModel, path: number[]) {
  let parent = getExpressionByPath(source, path);
  parent.value.push(expression);
}

export function AdvanceFilterViewContent(props: Props) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [allowDrop, setAllowDrop] = React.useState(false);
  const [draggingItem, setDraggingItem] = React.useState("None");

  const [queryExpression, setQueryExpression] = React.useState<ExpressionModel>(DEFAULT_EXPRESSION);

  const fieldsWithFilter = React.useMemo(
    () =>
      props.schema.fields.filter(
        v => v.title != null && props.schema.filters.find(v => v.fieldName === v.fieldName) != null
      ),
    [props.schema]
  );

  React.useEffect(() => {
    if (props.currentFilters.length === 1 && props.currentFilters[0].type === FilterSchemaType.AND)
      setQueryExpression(createExpressionFromFilter(props.currentFilters[0], [0]));
    else if (props.currentFilters.length === 0)
      setQueryExpression(createExpressionFromFilter({ ...DEFAULT_EXPRESSION }, [0]));
    else setQueryExpression(createExpressionFromFilter({ ...DEFAULT_EXPRESSION, value: props.currentFilters }, [0]));
    return () => setQueryExpression(DEFAULT_EXPRESSION);
  }, [props.currentFilters]);

  function onDragEnd(result: any) {
    setAllowDrop(true);
    setTimeout(() => setAllowDrop(false), 300);
    setIsDragging(false);
  }

  function onDragStart(result: any) {
    setAllowDrop(false);
    setIsDragging(true);
    setDraggingItem(result.draggableId);
  }

  function onDropped(id: string) {
    if (allowDrop) {
      const index = parseInt(draggingItem.split("dId")[0]);
      let filter: Filter;
      if ([AND_INDEX, OR_INDEX].includes(index)) {
        filter = {
          fieldName: "",
          type: index === AND_INDEX ? FilterSchemaType.AND : FilterSchemaType.OR,
          value: []
        };
      } else {
        const field = fieldsWithFilter[index];
        const firstFilter = props.schema.filters.find(v => v.fieldName === field.fieldName)!;
        if (firstFilter == null) return;
        filter = {
          fieldName: field.fieldName,
          type: firstFilter.type,
          value: null
        };
      }

      const path = id
        .split("#")[1]
        .split("-")
        .map(v => parseInt(v));
      insertInnerPath(queryExpression, createExpressionFromFilter(filter, []), path);
      setQueryExpression(createExpressionFromFilter(queryExpression, [0]));
      setAllowDrop(false);
    }
  }

  function createCategoriesFromSchema(): CategoryType[] {
    return [
      {
        title: "Fields",
        children: fieldsWithFilter.map((v, i) => {
          return {
            title: v.title,
            icon: getIconByFieldType(v.type),
            id: i
          };
        })
      }
    ];
  }

  return (
    <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
      <AdvanceFilterContext.Provider value={{ isDragging, onDropped }}>
        <div style={{ display: "flex", flexDirection: "row", width: "100%", height: "100%" }}>
          <ItemExplorer
            categories={[
              {
                title: "General",
                children: [
                  { title: "Or operator", icon: "flip_to_back", id: OR_INDEX },
                  { title: "And operator", icon: "flip_to_front", id: AND_INDEX }
                ]
              },
              ...createCategoriesFromSchema()
            ]}
          />
          <QueryView query={queryExpression} />
        </div>
      </AdvanceFilterContext.Provider>
    </DragDropContext>
  );
}

export function AdvanceFilterView(props: Props) {
  return (
    <Modal disableEnforceFocus open={true}>
      <div
        style={{
          backgroundColor: "white",
          borderRadius: 9,
          width: window.innerWidth * 0.7,
          height: window.innerHeight * 0.75,
          margin: "auto",
          marginTop: (window.innerHeight * 0.25) / 2,
          outline: "none"
        }}
      >
        <AdvanceFilterViewContent {...props} />
      </div>
    </Modal>
  );
}
