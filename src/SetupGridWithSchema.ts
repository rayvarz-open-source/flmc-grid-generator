import { GridElement } from "flmc-lite-renderer/build/form/elements/grid/GridElement";
import { Options } from "./Options";
import { Schema, FieldShemaTypeName, FilterSchemaType, SortSchemaType } from "./GridResultModel";
import { handleCustomComponentRenderer } from "./CustomCellRenderers";
import { DocumentModel } from "./DocumentModel";

export function setupGridWithSchema(
  schema: Schema,
  gridElement: GridElement,
  options: Options<any>,
  handleDocumentListClick: (documents: DocumentModel[]) => void
) {
  let hiddenFields = options.hideFields || [];

  gridElement.columnDefinitions(
    schema.fields
      .filter(field => field.isVisible && !hiddenFields.includes(field.fieldName))
      .sort((current, next) => next.order - current.order)
      .reverse()
      .map(field => {
        let filtering = false;
        if (field.type.name == FieldShemaTypeName.Int)
          filtering =
            schema.filters.filter(
              filter => filter.fieldName == field.fieldName && filter.type == FilterSchemaType.EQUAL_BY
            ).length > 0;
        if (field.type.name == FieldShemaTypeName.String)
          filtering =
            schema.filters.filter(filter => filter.fieldName == field.fieldName && filter.type == FilterSchemaType.LIKE)
              .length > 0;
        let definition: any = {
          field: field.fieldName,
          title: field.title,
          editable: field.isEditable ? "always" : "never",
          filtering: filtering,
          sorting:
            schema.sorts.filter(sort => sort.fieldName == field.fieldName && sort.type == SortSchemaType.All).length > 0
        };

        let customRenderer = handleCustomComponentRenderer(field, {
          onImageListClick: documents => handleDocumentListClick(documents)
        });

        if (customRenderer) definition.render = customRenderer;

        return definition;
      })
  );
}
