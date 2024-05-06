import { type Result } from 'app/services/expression';
import { type LoggingService } from 'app/services/logging';
import { delay } from 'base/delay';

export class LocalExpressionService {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly delayMillis: number,
  ) {
  }

  async evaluateExpression(expression: string): Promise<Result> {
    await delay(this.delayMillis);
    if (!expression.trim().startsWith('return')) {
      expression = 'return ' + expression;
    }
    try {
      const f = new Function(expression);
      const result = await f();
      if (typeof result === 'string') {
        return {
          type: 'string',
          value: result,
        };
      }
      if (typeof result === 'boolean') {
        return {
          type: 'boolean',
          value: result,
        };
      }
      if (typeof result === 'number') {
        return {
          type: 'number',
          value: result,
        };
      }
      return {
        type: 'unexpected_result',
        resultType: typeof result,
      };
    } catch (error) {
      this.loggingService.warn('user expression failed', {
        error,
      });
      return {
        type: 'bad_expression',
        expression,
      };
    }
  }
}
