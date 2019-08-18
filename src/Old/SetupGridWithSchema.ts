import { GridElement } from "flmc-lite-renderer/build/form/elements/grid/GridElement";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { handleCustomComponentRenderer } from "../CustomRowRenderHandler/CustomCellRenderers";
import { DocumentModel } from "../Models/DocumentModel";
import { FieldSchema, FieldShemaTypeName, Schema, SortSchemaType } from "./GridResultModel";
import { Options } from "./Options";

function isExportable(field: FieldSchema) {
  return (
    field.type.name != FieldShemaTypeName.Image && field.type.name != FieldShemaTypeName.ImageList && field.isVisible
  );
}

export function setupGridWithSchema(
  schema: Observable<Schema>,
  gridElement: GridElement,
  options: Options<any>,
  handleDocumentListClick: (documents: DocumentModel[]) => void
) {
  let hiddenFields = options.hideFields || [];

  gridElement.columnDefinitions(
    schema.pipe(
      map(schemaSnapshot =>
        schemaSnapshot.fields
          .filter(field => field.isVisible && !hiddenFields.includes(field.fieldName) && field.type != null)
          .sort((current, next) => next.order - current.order)
          .reverse()
          .map(field => {
            let filters = schemaSnapshot.filters.filter(filter => filter.fieldName === field.fieldName);
            let defaultFilter: any = filters.filter(v => v.isDefault);
            defaultFilter = defaultFilter.length > 0 ? defaultFilter[0] : undefined;
            let sorts = schemaSnapshot.sorts.filter(
              sort => sort.fieldName == field.fieldName && sort.type == SortSchemaType.All
            );

            let definition: any = {
              export: isExportable(field),
              field: field.fieldName,
              title: field.title,
              editable: field.isEditable ? "always" : "never",
              fieldDefinition: field,
              filter: defaultFilter,
              filterPlaceholder: filters.length > 0 ? filters[0].fieldName : " ",
              filtering: filters.length > 0,
              sorting: sorts.length > 0
            };

            let customRenderer = handleCustomComponentRenderer(field, {
              onImageListClick: documents => handleDocumentListClick(documents)
            });

            if (customRenderer) definition.render = customRenderer;

            return definition;
          })
      )
    )
  );
}
