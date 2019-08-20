import { Icon } from "@material-ui/core";
// @ts-ignore
import _momentJalali from "moment-jalali";
import * as React from "react";
import { QRCode } from "react-qrcode-logo";
import { DocumentModel } from "../../Models/DocumentModel";
import { FieldSchema, FieldShemaTypeName } from "../../Models/Field";
import { Barcode } from "./Barcode";
const momentJalali = _momentJalali;

export type RowRenderer = (rowData: any) => React.ReactElement;

export type CallBacks = {
  onImageListClick: (documents: DocumentModel[]) => void;
};

/**
 * Number.prototype.format(n, x)
 *
 * @param integer n: length of decimal
 * @param integer x: length of sections
 */
export const formatMoney = function(value: number, n: number, x: number) {
  var re = "\\d(?=(\\d{" + (x || 3) + "})+" + (n > 0 ? "\\." : "$") + ")";
  return value.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, "g"), "$&,");
};

export function handleCustomComponentRenderer(field: FieldSchema, callbacks: CallBacks): RowRenderer | undefined {
  switch (field.type.name) {
    case FieldShemaTypeName.Money:
      return rowData => <p>{formatMoney(rowData[field.fieldName], 0, 3)}</p>;
    case FieldShemaTypeName.Bit:
      return rowData => <Icon>{rowData[field.fieldName] ? "check" : "close"}</Icon>;
    case FieldShemaTypeName.PersianDate:
      return rowData => {
        let date = rowData[field.fieldName];
        if (!date) return <p> - </p>;
        return <p>{momentJalali(new Date(date).toISOString()).format("jYYYY/jM/jD")}</p>;
      };
    case FieldShemaTypeName.GregorianDateTime:
      return rowData => {
        let date = rowData[field.fieldName];
        if (!date) return <p> - </p>;
        return <p>{momentJalali(new Date(date).toISOString()).format("YYYY/M/D")}</p>;
      };
    case FieldShemaTypeName.Image:
      return rowData => {
        let document = rowData[field.fieldName] == null ? [] : [rowData[field.fieldName]];
        return <GridImageCell onClick={() => callbacks.onImageListClick(document)} documents={document} />;
      };
    case FieldShemaTypeName.String:
      if (!field.fieldName.toLowerCase().includes("title")) return undefined; // TODO: get this from server
      return rowData => <p style={{ minWidth: 150 }}>{rowData[field.fieldName]}</p>;
    case FieldShemaTypeName.ImageList:
      return rowData => (
        <GridImageCell
          onClick={() => callbacks.onImageListClick(rowData[field.fieldName])}
          documents={rowData[field.fieldName]}
        />
      );
    case FieldShemaTypeName.Barcode:
      return rowData => {
        let data = rowData[field.fieldName];
        if (data == null) return <> </>;
        return <Barcode value={data} />;
      };
    case FieldShemaTypeName.QRCode:
      return rowData => {
        let data = rowData[field.fieldName];
        if (data == null) return <> </>;
        return <QRCode value={data} />;
      };
    case FieldShemaTypeName.Object:
      return rowData => {
        let data = rowData[field.fieldName];
        data = data == null ? {} : data;
        data = data[field.type.source!.valueFieldName];
        return <p>{data + ""}</p>; // convert objects to string to be a valid react node
      };
    default:
      return rowData => {
        let data = rowData[field.fieldName];
        data = data == null ? " - " : data;
        return <p>{data + ""}</p>; // convert objects to string to be a valid react node
      };
  }
}

export type Props = {
  documents: DocumentModel[];
  onClick: () => void;
};

export function GridImageCell({ documents, onClick }: Props): React.ReactElement {
  return (
    <div
      style={{
        flexDirection: "row",
        position: "relative"
      }}
    >
      {documents.map((image, index) => (
        <a key={index + "_GridImageCell"} onClick={() => onClick()}>
          <img
            src={image.thumb}
            style={{
              transform: "translateY(-25px)",
              width: 50,
              height: 50,
              borderRadius: 5,
              position: "absolute",
              display: "block",
              boxShadow: "1px 1px 1px white",
              transition: "0.2s",
              cursor: "pointer",
              objectFit: "contain",
              marginRight: index * 9,
              zIndex: index + 1000
            }}
          />
        </a>
      ))}
    </div>
  );
}
