import { type DocumentService } from './document';
import { type LoggingService } from './logging';

export type Services = {
  readonly loggingService: LoggingService,
  readonly documentService: DocumentService,
};

export type ServicesDescriptor = {
  readonly loggingService: 'local',
  readonly documentService: 'local',
};
