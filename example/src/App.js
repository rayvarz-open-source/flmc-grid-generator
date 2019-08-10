import React from "react";
import logo from "./logo.svg";
import "./App.css";
import FLMC, { FormController, Label } from "flmc-lite-renderer";
import { createGridViaDataSource, createLocalGridGenerator } from "flmc-grid-generator";
import { FieldShemaTypeName } from "flmc-grid-generator/build/GridResultModel";
import { BehaviorSubject } from "rxjs";

class SampleForm extends FormController {
  time = new BehaviorSubject(null);
  date = new BehaviorSubject(null);
  dateTime = new BehaviorSubject(null);

  elements = [
    createLocalGridGenerator(
      {
        sorts: [],
        filters: [],
        fields: [
          {
            fieldName: "barcode",
            title: "Barcode",
            isVisible: true,
            type: {
              name: FieldShemaTypeName.Barcode
            }
          }
        ]
      },
      [
        {
          barcode: "21312414"
        }
      ]
    )
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
