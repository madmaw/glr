import {
  type ExpressionService,
  type Result,
} from 'app/services/expression';
import { type LoggingService } from 'app/services/logging';
import {
  action,
  observable,
  runInAction,
} from 'mobx';
import {
  type AsyncState,
  AsyncStateType,
} from 'ui/components/async/types';

export class ExpressionPresenter {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly expressionService: ExpressionService,
  ) {
  }

  @action
  setExpression(model: ExpressionModel, expression: string) {
    // do not allow modification of the expression while evaluation is in progress
    if (model.state?.type === AsyncStateType.Loading) {
      return;
    }
    model.expression = expression;
  }

  async evaluate(model: ExpressionModel) {
    // do not allow concurrent evaluation of expressions
    // TODO maybe further rate limit
    if (model.state?.type === AsyncStateType.Loading) {
      return;
    }
    runInAction(function () {
      model.state = {
        type: AsyncStateType.Loading,
        progress: undefined,
      };
    });
    try {
      const value = await this.expressionService.evaluateExpression(model.expression);
      runInAction(function () {
        model.state = {
          type: AsyncStateType.Success,
          value,
        };
      });
    } catch (error: unknown) {
      runInAction(function () {
        model.state = {
          type: AsyncStateType.Failure,
          // we don't have useful error types here
          reason: undefined,
        };
      });
      this.loggingService.error('unable to evaluate expression', {
        error,
      });
    }
  }
}

export class ExpressionModel {
  @observable.ref
  accessor expression: string = '';

  @observable.ref
  accessor state: AsyncState<Result, void, void> | undefined;

  constructor() {
  }
}
