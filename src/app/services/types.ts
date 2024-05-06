import { type ExpressionService } from './expression';
import { type LoggingService } from './logging';

export type Services = {
  readonly loggingService: LoggingService,
  readonly expressionService: ExpressionService,
};

export type ServicesDescriptor = {
  readonly loggingService: 'local',
  readonly expressionService: 'local',
};
