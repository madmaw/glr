import {
  type Services,
  type ServicesDescriptor,
} from 'app/services/types';
import { InMemoryDocumentService } from './document';
import { ConsoleLoggingService } from './logging';

const BASE_DELAY = 1000;

export function install({
  services: {
    loggingService: deferredLoggingService,
  },
  descriptors: {
    loggingService: loggingServiceDescriptor,
    documentService: documentServiceDescriptor,
  },
}: { services: Services, descriptors: ServicesDescriptor }): Partial<Services> {
  const loggingService = loggingServiceDescriptor === 'local' ? new ConsoleLoggingService({}) : undefined;
  const documentService = documentServiceDescriptor === 'local' ? new InMemoryDocumentService() : undefined;
  return {
    loggingService,
    documentService,
  };
}
