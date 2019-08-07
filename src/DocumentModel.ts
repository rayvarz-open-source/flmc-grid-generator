export interface DocumentModel {
  result: number;
  message: string;
  id: string;
  original: string;
  thumb: string;
  blurred: string;
}
export interface DocumentModelServer {
  result: number;
  message: string;
  id: string;
  original: string;
  thumb: string;
  blurred: string;
}
export class DocumentViewModel {
  constructor(docModel: DocumentModel, isDeleted: boolean, isNew: boolean) {
    this.result = docModel.result;
    this.message = docModel.message;
    this.id = docModel.id;
    this.original = docModel.original;
    this.thumb = docModel.thumb;
    this.blurred = docModel.blurred;
    this.isDeleted = isDeleted;
    this.isNew = isNew;
  }
  result: number;
  message: string;
  id: string;
  original: string;
  thumb: string;
  blurred: string;
  isDeleted: boolean;
  isNew: boolean;
}
