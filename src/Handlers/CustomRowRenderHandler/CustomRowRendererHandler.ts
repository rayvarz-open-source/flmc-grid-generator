import { Image, ImageScaleType } from "flmc-lite-renderer";
import { ColumnDefinitions } from "flmc-lite-renderer/build/form/elements/grid/GridElementAttributes";
import { map } from "rxjs/operators";
import { DocumentModel } from "../../Models/DocumentModel";
import { Schema } from "../../Models/Schema";
import { Handler } from "../Handlers";
import { handleCustomComponentRenderer } from "./CustomCellRenderers";

export const customRowRendererHandler: Handler = (props, observables) => {
  const handleDocumentList = (documents: DocumentModel[]) => {
    props.elements.documentListContainer.childrenContainer.next(
      documents.map(document =>
        Image(document.original)
          .height(250)
          .width(250)
          .scale(ImageScaleType.Contain)
      )
    );
    props.elements.documentListModal.openContainer.next(true);
  };

  const colDefinitionHandler = observables.columnDefinitions.pipe(
    map(([cols, definitions]): [ColumnDefinitions, Schema] => {
      const newCols = cols.map(col => {
        const field = col.fieldDefinition;
        const renderer = handleCustomComponentRenderer(field, {
          onImageListClick: documents => handleDocumentList(documents)
        });

        return {
          ...col,
          render: renderer
        };
      });
      return [newCols, definitions];
    })
  );

  return {
    ...observables,
    columnDefinitions: colDefinitionHandler
  };
};
