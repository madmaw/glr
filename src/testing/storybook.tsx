import { i18n } from '@lingui/core';
import { type Messages } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { logger } from '@storybook/client-logger';
import { type InputType } from '@storybook/types';
import { useAsyncEffect } from 'base/react/async';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
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

export const storybookLocaleContext = createContext<string>('en');

export const StorybookLocaleProvider = storybookLocaleContext.Provider;

export type StorybookLocaleConsumerProps = PropsWithChildren<{
  messagesPath: string,
}>;

export function createStorybookLoadMessages(messagesPath: string) {
  return async function (locale: string) {
    const { messages } = await requireTranslations(`${messagesPath}/${locale}`);
    return messages;
  };
}

export function StorybookLocaleConsumer({
  messagesPath,
  children,
}: StorybookLocaleConsumerProps) {
  const locale = useContext(storybookLocaleContext);
  const loadMessages = useMemo(function () {
    return createStorybookLoadMessages(messagesPath);
  }, [messagesPath]);
  return (
    <StorybookLinguiProvider
      locale={locale}
      loadMessages={loadMessages}
    >
      {children}
    </StorybookLinguiProvider>
  );
}

export function StorybookLinguiProvider({
  locale,
  loadMessages,
  children,
}: PropsWithChildren<{
  loadMessages: (locale: string) => Promise<Messages>,
  locale: string,
}>) {
  // TODO presenter?
  const [
    state,
    setState,
  ] = useState<AsyncState<void, void, void>>({
    type: AsyncStateType.Loading,
    progress: undefined,
  });
  useAsyncEffect(async function () {
    let canceled = false;
    try {
      setState({
        type: AsyncStateType.Loading,
        progress: undefined,
      });
      const messages = await loadMessages(locale);
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
    loadMessages,
    locale,
  ]);

  return (
    <AsyncBoundaryDelegate state={state}>
      <I18nProvider i18n={i18n}>
        {children}
      </I18nProvider>
    </AsyncBoundaryDelegate>
  );
}
