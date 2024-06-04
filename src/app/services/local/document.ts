import { type Document } from 'app/domain/model';
import { type DocumentService } from 'app/services/document';

export class InMemoryDocumentService implements DocumentService {
  async getDocument(id: string): Promise<Document> {
    return {
      id,
      width: 128,
      height: 128,
      channels: [],
    };
  }
}
