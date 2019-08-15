import IElement from "flmc-lite-renderer/build/flmc-data-layer/FormController/IElement";
import { Image, ImageScaleType, Modal, Container, ContainerDirection } from "flmc-lite-renderer";
import { BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import { DocumentModel } from "./DocumentModel";

export function setupImagePreviewModal(
  documentList: BehaviorSubject<DocumentModel[]>,
  open: BehaviorSubject<boolean>
): IElement {
  let documentListImageElement = documentList.pipe(
    map(v =>
      v.map(document =>
        Image(document.original)
          .height(250)
          .width(250)
          .scale(ImageScaleType.Contain)
      )
    )
  );
  let documentListElement = Modal(Container(documentListImageElement).direction(ContainerDirection.Row)).open(open);

  return documentListElement;
}
