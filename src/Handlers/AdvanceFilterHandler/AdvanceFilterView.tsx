import * as React from "react";
import ItemExplorer from "./ItemExplorer";
export type Props = {};

export function AdvanceFilterView(props: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "row", width: "100%", height: "100%", position: "absolute" }}>
      <ItemExplorer
        categories={[
          {
            title: "General",
            children: [
                { title: "Or operator" },
                { title: "And operator" },
            ]
          },
          {
            title: "Fields",
            children: [
                { title: "Start Date" },
                { title: "End Date" },
                { title: "Title" },
                { title: "Description" },
            ]
          },
          {
            title: "Schema Templates",
            children: [
                { title: "Item Available" },
                { title: "Order Point" },
            ]
          },
          {
            title: "User Templates",
            children: [
                { title: "My Template 1" },
                { title: "My Filter Template 3" },
            ]
          },
        ]}
      />
      <div style={{ flex: 9 }} />
    </div>
  );
}
