import {
  type Document,
  type DocumentId,
} from 'app/domain/model';

export type DocumentService = {
  getDocument(id: DocumentId): Promise<Document>,
};
