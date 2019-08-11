import React from "react";
import logo from "./logo.svg";
import "./App.css";
import FLMC, { FormController, Label, Button } from "flmc-lite-renderer";
import { createGridViaDataSource, createLocalGridGenerator } from "flmc-grid-generator";
import { defaultOptions } from "flmc-grid-generator/build/Options";
import { FieldShemaTypeName } from "flmc-grid-generator/build/GridResultModel";
import { BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";

class SampleForm extends FormController {
  time = new BehaviorSubject(null);
  date = new BehaviorSubject(null);
  dateTime = new BehaviorSubject(null);
  selection = new BehaviorSubject([]);

  elements = [
    createGridViaDataSource("http://178.22.121.237/aloni.web.api/api/item/getAllStoreItems", {
      filters: [
        {
          fieldName: "fStoreId",
          type: "equalBy",
          value: 9
        }
      ],
      selection: this.selection,
      ...defaultOptions
    }),
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
