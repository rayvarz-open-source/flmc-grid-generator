import { Modal } from "@material-ui/core";
import * as React from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { Filter, FilterSchemaType } from "../../Models/Filter";
import { AdvanceFilterContext } from "./AdvanceFilterContext";
import ItemExplorer from "./ItemExplorer";
import { ExpressionModel } from "./QueryViewer/ExpressionModel";
import { QueryView } from "./QueryViewer/QueryView";

export type Props = {};

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

export function AdvanceFilterViewContent(props: Props) {
  const [isDragging, setIsDragging] = React.useState(false);

  function onDragEnd(result: any) {
    setIsDragging(false);
  }
  function onDragStart(result: any) {
    setIsDragging(true);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
      <AdvanceFilterContext.Provider value={{ isDragging }}>
        <div style={{ display: "flex", flexDirection: "row", width: "100%", height: "100%" }}>
          <ItemExplorer
            categories={[
              {
                title: "General",
                children: [
                  { title: "Or operator", icon: "flip_to_back", id: 0 },
                  { title: "And operator", icon: "flip_to_front", id: 1 }
                ]
              },
              {
                title: "Fields",
                children: [
                  { title: "Start Date", icon: "date_range", id: 2 },
                  { title: "End Date", icon: "date_range", id: 3 },
                  { title: "Title", icon: "subtitles", id: 4 },
                  { title: "Description", icon: "subtitles", id: 5 }
                ]
              },
              {
                title: "Schema Templates",
                children: [
                  { title: "Item Available", icon: "check_box", id: 6 },
                  { title: "Order Point", icon: "menu", id: 7 }
                ]
              },
              {
                title: "User Templates",
                children: [
                  { title: "My Template 1", icon: "menu", id: 8 },
                  { title: "My Filter Template 3", icon: "menu", id: 9 },
                ]
              }
            ]}
          />
          <QueryView query={createExpressionFromFilter(FILTER, [0])} />
        </div>
      </AdvanceFilterContext.Provider>
    </DragDropContext>
  );
}

export function AdvanceFilterView() {
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
        <AdvanceFilterViewContent />
      </div>
    </Modal>
  );
}
