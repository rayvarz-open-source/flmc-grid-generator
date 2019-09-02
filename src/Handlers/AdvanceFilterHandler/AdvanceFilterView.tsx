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

const FILTER = {
  type: FilterSchemaType.AND,
  fieldName: "",
  value: [
    {
      type: FilterSchemaType.OR,
      fieldName: "",
      value: [
        {
          type: FilterSchemaType.EQUAL_BY,
          fieldName: "Title",
          value: "test"
        },
        {
          type: FilterSchemaType.EQUAL_BY,
          fieldName: "Title",
          value: "test"
        }
      ]
    },
    {
      type: FilterSchemaType.EQUAL_BY,
      fieldName: "Title",
      value: "test"
    },
    {
      type: FilterSchemaType.OR,
      fieldName: "",
      value: [
        {
          type: FilterSchemaType.EQUAL_BY,
          fieldName: "Title",
          value: "test"
        },
        {
          type: FilterSchemaType.EQUAL_BY,
          fieldName: "Title",
          value: "test"
        },
        {
          type: FilterSchemaType.EQUAL_BY,
          fieldName: "Title",
          value: "test"
        }
      ]
    },
    {
      type: FilterSchemaType.OR,
      fieldName: "",
      value: [
        {
          type: FilterSchemaType.EQUAL_BY,
          fieldName: "Title",
          value: "test"
        }
      ]
    }
  ]
};

function createExpressionFromFilter(filter: Filter, startPath: number[]): ExpressionModel {
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

export function AdvanceFilterViewContent(props: Props) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [allowDrop, setAllowDrop] = React.useState(false);
  const [draggingItem, setDraggingItem] = React.useState("None");

  const fieldsWithFilter = React.useMemo(
    () =>
      props.schema.fields.filter(
        v => v.title != null && props.schema.filters.find(v => v.fieldName == v.fieldName) != null
      ),
    [props.schema]
  );

  function onDragEnd(result: any) {
    setAllowDrop(true);
    setTimeout(() => setAllowDrop(false), 300);
    setIsDragging(false);
    setDraggingItem("None");
  }

  function onDragStart(result: any) {
    setAllowDrop(false);
    setIsDragging(true);
    setDraggingItem(result.draggableId);
  }

  function onDropped(id: string) {
    if (allowDrop) {
      alert(id);
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
                  { title: "Or operator", icon: "flip_to_back", id: -2 },
                  { title: "And operator", icon: "flip_to_front", id: -4 }
                ]
              },
              ...createCategoriesFromSchema()
            ]}
          />
          <QueryView query={createExpressionFromFilter(FILTER, [0])} />
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
