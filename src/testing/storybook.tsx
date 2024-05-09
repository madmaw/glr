import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';

import { logger } from '@storybook/client-logger';
import { type InputType } from '@storybook/types';
import { useAsyncEffect } from 'base/react/async';
import {
  type ComponentType,
  createContext,
  useContext,
  useState,
} from 'react';
import { AsyncBoundaryDelegate } from 'ui/components/async/boundary';
import {
  type AsyncState,
  AsyncStateType,
} from 'ui/components/async/types';
import { requireTranslations } from './require';

export function createSelectInputTypes<
  Value,
  Label extends string = string,
>(mapping: Record<Label, Value>): InputType {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const options = Object.keys(mapping) as Label[];
  return {
    options,
    mapping,
    control: {
      type: 'select',
    },
  };
}

const localeContext = createContext<string>('en');

export const LocaleProvider = localeContext.Provider;

export type LocaleConsumerProps<P> = P & {
  StorybookComponent: ComponentType<Omit<P, 'StorybookComponent' | 'messagesPath'>>,
  messagesPath: string,
};

export function LocaleConsumer<P>({
  StorybookComponent,
  messagesPath,
  ...remainder
}: LocaleConsumerProps<P>) {
  // TODO presenter?
  const [
    state,
    setState,
  ] = useState<AsyncState<void, void, void>>({
    type: AsyncStateType.Loading,
    progress: undefined,
  });
  const locale = useContext(localeContext);
  useAsyncEffect(async function () {
    let canceled = false;
    try {
      setState({
        type: AsyncStateType.Loading,
        progress: undefined,
      });
      const { messages } = await requireTranslations(`${messagesPath}/${locale}`);
      if (!canceled) {
        i18n.loadAndActivate({
          locale,
          messages,
        });
        setState({
          type: AsyncStateType.Success,
          value: undefined,
        });
      }
    } catch (e) {
      setState({
        type: AsyncStateType.Failure,
        reason: undefined,
      });
      logger.error('unable to load locale', locale, e);
    }
    return function () {
      canceled = true;
    };
  }, [
    messagesPath,
    locale,
  ]);

  return (
    <AsyncBoundaryDelegate state={state}>
      <I18nProvider i18n={i18n}>
        <StorybookComponent {...remainder} />
      </I18nProvider>
    </AsyncBoundaryDelegate>
  );
}
