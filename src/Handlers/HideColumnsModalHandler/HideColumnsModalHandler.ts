import { Container, ContainerDirection, SelectBox, SelectBoxVariant } from "flmc-lite-renderer";
import IElement from "flmc-lite-renderer/build/flmc-data-layer/FormController/IElement";
import { BehaviorSubject, combineLatest } from "rxjs";
import { first, map, skip } from "rxjs/operators";
import { FieldSchema } from "../../Models/Field";
import { Localization } from "../../Models/Localization";
import { Schema } from "../../Models/Schema";
import { Handler } from "../Handlers";

function chunk<T>(array: Array<T>, size: number): Array<Array<T>> {
  const chunked_arr: Array<Array<T>> = [];
  for (let i = 0; i < array.length; i++) {
    const last = chunked_arr[chunked_arr.length - 1];
    if (!last || last.length === size) {
      chunked_arr.push([array[i]]);
    } else {
      last.push(array[i]);
    }
  }
  return chunked_arr;
}

export function setupHideColumnModal(schema: BehaviorSubject<Schema>): IElement {
  function createControllerForField(field: FieldSchema): BehaviorSubject<boolean | null> {
    let subject = new BehaviorSubject<boolean | null>(field.isVisible);

    // update schema if value changed
    subject
      .pipe(
        skip(1),
        first()
      )
      .subscribe(isChecked =>
        schema.next({
          ...schema.value,
          fields: schema.value.fields.map(foundField => {
            if (foundField.fieldName !== field.fieldName) return foundField;
            return {
              ...foundField,
              isVisible: isChecked === true
            };
          })
        })
      );

    return subject;
  }

  function createCheckboxElements(snapshot: Schema): IElement[] {
    let elements: IElement[] = [];

    let chunkedFields = chunk(snapshot.fields, 3);

    for (let index = 0; index < chunkedFields.length; index++) {
      let chunk = chunkedFields[index];
      let children: IElement[] = chunk.map(field =>
        SelectBox(createControllerForField(field), true)
          .label(field.title || field.fieldName)
          .variant(SelectBoxVariant.CheckBox)
      );
      if (index === chunkedFields.length - 1 && index > 0 && chunk.length < chunkedFields[index - 1].length) {
        let numberOfPlaceholderElements = chunkedFields[index - 1].length - chunk.length;
        for (let i = 0; i < numberOfPlaceholderElements; i++) children.push(Container([]));
      }
      elements.push(
        Container(children)
          .flex(children.map(_ => 1))
          .direction(ContainerDirection.Row)
      );
    }

    return elements;
  }

  return Container(schema.pipe(map(snapshot => [...createCheckboxElements(snapshot)])));
}

export const hideColumnsModalHandler: Handler = (props, observables) => {
  const openHideColumnsModal = (localization: Localization) => {
    props.elements.hideColumnModal.childContainer.next(setupHideColumnModal(props.controllers.schemaController));
    props.elements.hideColumnModal.titleContainer.next(localization.columnVisibilityTitle);
    props.elements.hideColumnModal.openContainer.next(true);
  };

  const actions = combineLatest(observables.actionDefinitions, props.options.localization).pipe(
    map(([actionDefs, localization]) => {
      return [
        ...actionDefs,
        {
          icon: "visibility",
          isFreeAction: true,
          tooltip: localization.columnVisibility,
          onClick: async (event: any, data: any) => openHideColumnsModal(localization)
        }
      ];
    })
  );

  return {
    ...observables,
    actionDefinitions: actions
  };
};
