import { Container, Grid } from "flmc-lite-renderer";
import IElement from "flmc-lite-renderer/build/flmc-data-layer/FormController/IElement";
import { GridElement } from "flmc-lite-renderer/build/form/elements/grid/GridElement";
import { BehaviorSubject, isObservable, Observable } from "rxjs";
import { DocumentModel } from "../Models/DocumentModel";
import { Schema } from "./GridResultModel";
import { defaultOptions, Options } from "./Options";
import { setupGridWithOptions } from "./SetupGridWithOptions";
import { setupGridWithSchema } from "./SetupGridWithSchema";
import { HideColumnsController, setupHideColumnModal } from "./SetupHideColumnModal";
import { setupImagePreviewModal } from "./SetupImagePreviewModal";

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
