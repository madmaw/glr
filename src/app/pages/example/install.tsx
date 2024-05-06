import { t } from '@lingui/macro';
import { type Page } from 'app/pages/types';
import { type Result } from 'app/services/expression';
import { type Services } from 'app/services/types';
import { type LinguiProvider } from 'app/ui/lingui/types';
import { delay } from 'base/delay';
import { useDeferredConstant } from 'base/react/constant';
import { useObserverComponent } from 'base/react/mobx';
import {
  createPartialComponent,
  usePartialComponent,
  usePartialObserverComponent,
} from 'base/react/partial';
import {
  type FunctionComponent,
  useCallback,
  useRef,
} from 'react';
import { CustomAsync } from 'ui/components/async/custom';
import { AsyncStateType } from 'ui/components/async/types';
import {
  AlertIcon,
  SpinnerIcon,
} from 'ui/components/icon/icons';
import { Message } from 'ui/components/message';
import { ExpressionInput } from './expression/input';
import { ExpressionOutput } from './expression/output';
import {
  ExpressionModel,
  ExpressionPresenter,
} from './expression/presenter';
import { Skeleton } from './skeleton';

const Failure: FunctionComponent = createPartialComponent(
  Message,
  {
    Icon: AlertIcon,
    message: t`Something happened on our end. Please try again`,
  },
);

const Loading: FunctionComponent = createPartialComponent(
  Message,
  {
    Icon: SpinnerIcon,
    message: t`Calculating…`,
  },
);

export function install({
  services: {
    loggingService,
    expressionService,
  },
  LinguiProvider,
}: {
  services: Services,
  LinguiProvider: LinguiProvider,
}): Page {
  async function loadMessages(locale: string) {
    // add in some delay for demonstration purposes only
    await delay(200);
    return import(`./locales/${locale}.po`);
  }

  const presenter = new ExpressionPresenter(loggingService, expressionService);

  function Component({
    locales,
  }: {
    locales: readonly string[],
  }) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const model = useDeferredConstant(function () {
      return new ExpressionModel();
    });

    const onChangeExpression = useCallback(function (expression: string) {
      presenter.setExpression(model, expression);
    }, [model]);

    const onEvaluateExpression = useCallback(async function () {
      try {
        await presenter.evaluate(model);
      } finally {
        inputRef.current?.focus();
      }
    }, [model]);

    const Input = usePartialObserverComponent(function () {
      return {
        ref: inputRef,
        disabled: model.state?.type === AsyncStateType.Loading,
        expression: model.expression,
        onChangeExpression,
        onEvaluateExpression,
      };
    }, [
      model,
      onChangeExpression,
      onEvaluateExpression,
    ], ExpressionInput);

    const Success = useCallback(function ({ value }: { value: Result }) {
      return <ExpressionOutput result={value} />;
    }, []);

    const ExpressionAsync = CustomAsync<Result>;

    const Output = usePartialComponent(function () {
      return {
        Success,
        Failure,
        Loading,
      };
    }, [Success], ExpressionAsync);

    const ObserverOutput = useObserverComponent(function () {
      if (model.state == null) {
        return null;
      }
      return <Output state={model.state} />;
    }, [
      model,
      Output,
    ]);

    return (
      <LinguiProvider
        loadMessages={loadMessages}
        locales={locales}
      >
        <Skeleton
          Input={Input}
          Output={ObserverOutput}
        />
      </LinguiProvider>
    );
  }

  return {
    Component,
  };
}
