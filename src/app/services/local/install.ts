import {
  type Services,
  type ServicesDescriptor,
} from 'app/services/types';
import { LocalExpressionService } from './expression';
import { ConsoleLoggingService } from './logging';

const BASE_DELAY = 1000;

export function install({
  services: {
    loggingService: deferredLoggingService,
  },
  descriptors: {
    loggingService: loggingServiceDescriptor,
    expressionService: expressionServiceDescriptor,
  },
}: { services: Services, descriptors: ServicesDescriptor }): Partial<Services> {
  const loggingService = loggingServiceDescriptor === 'local' ? new ConsoleLoggingService({}) : undefined;
  const expressionService = expressionServiceDescriptor === 'local'
    ? new LocalExpressionService(deferredLoggingService, BASE_DELAY)
    : undefined;
  return {
    loggingService,
    expressionService,
  };
}
