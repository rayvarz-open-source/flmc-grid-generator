import * as React from "react";
import { FilterSchemaType } from "../../Models/Filter";
import ItemExplorer from "./ItemExplorer";
import { QueryView } from "./QueryViewer/QueryView";
export type Props = {};

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
      <QueryView
        query={{
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
            }
          ]
        }}
      />
    </div>
  );
}
