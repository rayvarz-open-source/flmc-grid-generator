import * as React from "react";
import { Filter, FilterSchemaType } from "../../Models/Filter";
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
    },
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

export function AdvanceFilterView(props: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "row", width: "100%", height: "100%", position: "absolute" }}>
      <ItemExplorer
        categories={[
          {
            title: "General",
            children: [{ title: "Or operator", icon: "flip_to_back" }, { title: "And operator", icon: "flip_to_front" }]
          },
          {
            title: "Fields",
            children: [
              { title: "Start Date", icon: "date_range" },
              { title: "End Date", icon: "date_range" },
              { title: "Title", icon: "subtitles" },
              { title: "Description", icon: "subtitles" }
            ]
          },
          {
            title: "Schema Templates",
            children: [{ title: "Item Available", icon: "check_box" }, { title: "Order Point", icon: "menu" }]
          },
          {
            title: "User Templates",
            children: [{ title: "My Template 1", icon: "menu" }, { title: "My Filter Template 3", icon: "menu" }]
          }
        ]}
      />
      <QueryView query={createExpressionFromFilter(FILTER, [0])} />
    </div>
  );
}
