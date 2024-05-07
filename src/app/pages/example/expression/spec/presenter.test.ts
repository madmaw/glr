import {
  ExpressionModel,
  ExpressionPresenter,
} from 'app/pages/example/expression/presenter';
import {
  type ExpressionService,
  type Result,
} from 'app/services/expression';
import { LocalExpressionService } from 'app/services/local/expression';
import { ConsoleLoggingService } from 'app/services/local/logging';
import { type LoggingService } from 'app/services/logging';
import { createMockedInstance } from 'testing/mock';
import { AsyncStateType } from 'ui/components/async/types';
import { type Mocked } from 'vitest';

suite('ExpressionPresenter', function () {
  let presenter: ExpressionPresenter;
  let model: ExpressionModel;
  let loggingService: Mocked<LoggingService>;
  let expressionService: Mocked<ExpressionService>;

  beforeEach(function () {
    loggingService = createMockedInstance(ConsoleLoggingService);
    expressionService = createMockedInstance(LocalExpressionService);
    presenter = new ExpressionPresenter(loggingService, expressionService);
    model = new ExpressionModel();
  });

  it.each([
    '1+1',
    '',
    'abc',
  ])('sets the expression %s', function (expression) {
    presenter.setExpression(model, expression);
    expect(model.expression).toBe(expression);
  });

  it('does not set the expression when the model is loading', function () {
    const originalExpression = '1';
    model.expression = originalExpression;
    model.state = {
      type: AsyncStateType.Loading,
      progress: undefined,
    };
    presenter.setExpression(model, '2');
    expect(model.expression).toBe(originalExpression);
  });

  describe.each<[string, Result]>([
    [
      '1',
      {
        type: 'number',
        value: 1,
      },
    ],
    [
      'abc',
      {
        type: 'bad_expression',
        expression: 'something else',
      },
    ],
    [
      'Math.random',
      {
        type: 'unexpected_result',
        resultType: 'Function',
      },
    ],
  ])('on success with expression %s ', function (expression, result) {
    let promise: Promise<void>;
    beforeEach(function () {
      model.expression = expression;
      expressionService.evaluateExpression.mockResolvedValueOnce(result);
      expect(expressionService.evaluateExpression).not.toHaveBeenCalled();
      expect(model.state).toBeUndefined();
      promise = presenter.evaluate(model);
    });

    it('sets the loading state while loading', async function () {
      expect(model.state?.type).toBe(AsyncStateType.Loading);
      await promise;
      expect(model.state?.type).toBe(AsyncStateType.Success);
    });

    it('evaluates the expression and writes back the result', async function () {
      await promise;
      expect(expressionService.evaluateExpression).toHaveBeenCalledOnce();
      expect(expressionService.evaluateExpression).toHaveBeenCalledWith(expression);
      expect(model.state).toEqual({
        type: AsyncStateType.Success,
        value: result,
      });
    });

    it('leaves the original expression intact', async function () {
      await promise;
      expect(model.expression).toBe(expression);
    });

    it('does not log an error', async function () {
      await promise;
      expect(loggingService.error).not.toHaveBeenCalled();
    });
  });

  describe('on failure', function () {
    const expression = '1';
    beforeEach(async function () {
      model.expression = expression;
      expressionService.evaluateExpression.mockRejectedValueOnce(new Error());
      expect(loggingService.error).not.toHaveBeenCalled();
      await presenter.evaluate(model);
    });
    it('sets the error state', function () {
      expect(model.state?.type).toBe(AsyncStateType.Failure);
    });
    it('logs the error', function () {
      expect(loggingService.error).toHaveBeenCalledOnce();
    });
    it('leaves the original expression intact', function () {
      expect(model.expression).toBe(expression);
    });
  });
});
