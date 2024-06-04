import {
  documentDescriptor,
  type DocumentId,
  type MutableDocument,
} from 'app/domain/model';
import { type DocumentService } from 'app/services/document';
import { type LoggingService } from 'app/services/logging';
import { runInAction } from 'mobx';
import {
  type AsyncState,
  AsyncStateType,
} from 'ui/components/async/types';

export class EditPresenter {
  constructor(
    private readonly documentService: DocumentService,
    private readonly loggingService: LoggingService,
  ) {
  }

  async loadDocument(model: EditModel) {
    runInAction(function () {
      model.state = {
        type: AsyncStateType.Loading,
        progress: undefined,
      };
    });
    const { documentId } = model;
    try {
      const document = await this.documentService.getDocument(documentId);
      const mutableDocument = documentDescriptor.create(document);
      runInAction(function () {
        model.state = {
          type: AsyncStateType.Success,
          value: mutableDocument,
        };
      });
    } catch (e) {
      runInAction(function () {
        model.state = {
          type: AsyncStateType.Failure,
          reason: undefined,
        };
      });
      this.loggingService.errorException(e, 'unable to load document');
    }
  }
}

export class EditModel {
  constructor(readonly documentId: DocumentId) {
  }

  state: AsyncState<MutableDocument, void, void> = {
    type: AsyncStateType.Loading,
    progress: undefined,
  };
}
