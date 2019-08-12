import { BehaviorSubject } from "rxjs";
import { Schema, FieldSchema } from "./GridResultModel";
import { Modal, Container, SelectBox, SelectBoxVariant, ContainerDirection, Button } from "flmc-lite-renderer";
import { ElementType } from "flmc-lite-renderer/build/form/elements/ElementType";
import { map, skip, first } from "rxjs/operators";
import IElement from "flmc-lite-renderer/build/flmc-data-layer/FormController/IElement";
import { Options } from "./Options";

export type HideColumnsController = {
  open: BehaviorSubject<boolean>;
  element: IElement;
};

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

export function setupHideColumnModal(schema: BehaviorSubject<Schema>, options: Options<any>): HideColumnsController {
  let open = new BehaviorSubject<boolean>(false);

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

  //   function changeAllVisibilityStates(visible: boolean) {
  //     schema.next({
  //       ...schema.value,
  //       fields: schema.value.fields.map(i => {
  //         return { ...i, isVisible: visible };
  //       })
  //     });
  //   }

  //   let selectDeselectAllContainer = Container([
  //     Button("Select All").onClick(() => changeAllVisibilityStates(true)),
  //     Button("Deselect All").onClick(() => changeAllVisibilityStates(false))
  //   ]).direction(ContainerDirection.RowReverse);

  let element = Modal(
    Container(
      schema.pipe(
        map(snapshot => [
          ...createCheckboxElements(snapshot)
          // selectDeselectAllContainer
        ])
      )
    )
  )
    .minWidth(window.innerWidth * 0.7)
    .maxWidth(window.innerWidth)
    .maxHeight(window.innerHeight)
    .title(options.localization.columnVisibilityTitle)
    .noBackdropClickClose(false)
    .noEscapeKeyDownClose(false)
    .open(open);

  return { open, element };
}
