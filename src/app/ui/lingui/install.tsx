import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { type LoggingService } from 'app/services/logging';
import { useAsyncEffect } from 'base/react/async';
import { usePartialObserverComponent } from 'base/react/partial';
import { useMemo } from 'react';
import { AsyncBoundaryDelegate } from 'ui/components/async/boundary';
import {
  LinguiModel,
  LinguiPresenter,
} from './presenter';
import {
  type LinguiProvider,
  type LinguiProviderProps,
} from './types';

export function install({
  loggingService,
}: {
  loggingService: LoggingService,
}): LinguiProvider {
  const presenter = new LinguiPresenter(loggingService, i18n);

  return function ({
    loadMessages,
    locales,
    children,
  }: LinguiProviderProps) {
    const model = useMemo(function () {
      return new LinguiModel();
    }, []);
    useAsyncEffect(async function () {
      return presenter.loadLocale(model, locales, loadMessages);
    }, [
      model,
      locales,
      loadMessages,
    ]);
    const ObservingAsyncBoundaryDelegate = usePartialObserverComponent(function () {
      return {
        state: model.state,
      };
    }, [model], AsyncBoundaryDelegate);
    return (
      <ObservingAsyncBoundaryDelegate>
        <I18nProvider
          i18n={i18n}
        >
          {children}
        </I18nProvider>
      </ObservingAsyncBoundaryDelegate>
    );
  };
}
