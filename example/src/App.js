import { GridGenerator } from "flmc-grid-generator";
import FLMC, { Button, FormController, Label } from "flmc-lite-renderer";
import React from "react";
import { BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import "./App.css";

const createGridViaDataSource = datasource => {
  return GridGenerator({
    dataSource: async dataSourceProps => {
      let result = await fetch(datasource, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          storeId: 9
        },
        body: JSON.stringify({
          filters: [
            {
              fieldName: "fStoreId",
              type: "equalBy",
              value: 9
            },
            ...dataSourceProps.filters
          ],
          sorts: dataSourceProps.sorts,
          ignoredFields: [],
          schema: dataSourceProps.needSchema,
          pagination: {
            needInfo: dataSourceProps.needPagination,
            pageNo: dataSourceProps.pageNo,
            pageSize: dataSourceProps.pageSize
          }
        })
      });
      let resultAsJson = await result.json();
      return resultAsJson;
    }
  });
};

class SampleForm extends FormController {
  time = new BehaviorSubject(null);
  date = new BehaviorSubject(null);
  dateTime = new BehaviorSubject(null);
  selection = new BehaviorSubject([]);
  //
  elements = [
    createGridViaDataSource("-"),
    Label(this.selection.pipe(map(v => `${v.length} selected`))),
    Button("deselect All").onClick(() => this.selection.next([]))
  ];
}

const categoties = {
  root: {
    name: "Root",
    hidden: false
  }
};

const routes = [
  {
    path: "/",
    builder: (path, params) => new SampleForm(),
    category: categoties.root,
    name: "Home",
    hidden: false
  }
];

function App() {
  return <FLMC routes={routes} />;
}

export default App;
