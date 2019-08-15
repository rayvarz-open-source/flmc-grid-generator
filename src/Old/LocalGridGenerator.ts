import { defaultOptions, Options } from "./Options";
import IElement from "flmc-lite-renderer/build/flmc-data-layer/FormController/IElement";
import { BehaviorSubject, Observable, isObservable } from "rxjs";
import { Container, Grid } from "flmc-lite-renderer";
import { Schema } from "./GridResultModel";
import { DocumentModel } from "./DocumentModel";
import { setupImagePreviewModal } from "./SetupImagePreviewModal";
import { GridElement } from "flmc-lite-renderer/build/form/elements/grid/GridElement";
import { setupGridWithOptions } from "./SetupGridWithOptions";
import { setupGridWithSchema } from "./SetupGridWithSchema";
import { setupHideColumnModal, HideColumnsController } from "./SetupHideColumnModal";

export function createLocalGridGenerator<Model>(
  schema: BehaviorSubject<Schema> | Schema,
  items: Observable<Model[]> | Model[],
  options: Options<Model> = defaultOptions
): IElement {
  let containerChildren = new BehaviorSubject<IElement[]>([]);
  let container = Container(containerChildren);
  let itemsController = isObservable(items) ? items : new BehaviorSubject(items);
  let schemaController = isObservable(schema) ? schema : new BehaviorSubject(schema);

  let docuemntListOpen = new BehaviorSubject<boolean>(false);
  let docuemntList = new BehaviorSubject<DocumentModel[]>([]);
  let documentListElement = setupImagePreviewModal(docuemntList, docuemntListOpen);
  let hideColumnsModalController = setupHideColumnModal(schemaController, options);
  containerChildren.next([
    createGrid(
      itemsController,
      schemaController,
      options,
      {
        images: docuemntList,
        open: docuemntListOpen
      },
      hideColumnsModalController
    ),
    documentListElement,
    hideColumnsModalController.element
  ]);

  return container;
}

type DocumentListModel = {
  images: BehaviorSubject<DocumentModel[]>;
  open: BehaviorSubject<boolean>;
};

function createGrid<Model>(
  items: Observable<Model[]>,
  schema: Observable<Schema>,
  options: Options<Model>,
  documentListModalController: DocumentListModel,
  hideColumnModalController: HideColumnsController
): GridElement {
  let gridElement = Grid();

  let refreshEvent = options.refreshController || new BehaviorSubject<null>(null);
  setupGridWithOptions(gridElement, options, refreshEvent, undefined, hideColumnModalController);

  const handleDocumentList = (documents: DocumentModel[]) => {
    documentListModalController.images.next(documents);
    documentListModalController.open.next(true);
  };
  setupGridWithSchema(schema, gridElement, options, handleDocumentList);

  gridElement.datasource(items);
  return gridElement;
}