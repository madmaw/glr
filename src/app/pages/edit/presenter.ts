import {
  documentDescriptor,
  type DocumentId,
  type MutableDocument,
} from 'app/domain/model';
import { type DocumentService } from 'app/services/document';
import {
  GenericAsyncModel,
  GenericAsyncPresenter,
} from 'ui/components/async/generic';

export class EditPresenter extends GenericAsyncPresenter<MutableDocument, EditModel> {
  constructor(private readonly documentService: DocumentService) {
    super();
  }

  protected override async doLoadValue({ documentId }: EditModel): Promise<MutableDocument> {
    const document = await this.documentService.getDocument(documentId);
    return documentDescriptor.create(document);
  }
}
export class EditModel extends GenericAsyncModel<MutableDocument> {
  constructor(readonly documentId: DocumentId) {
    super();
  }
}
