import { type Messages } from '@lingui/core';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import {
  render,
  type RenderOptions,
} from '@testing-library/react';
import {
  type PropsWithChildren,
  type ReactNode,
  useCallback,
  useEffect,
} from 'react';
import {
  MetricsProvider,
  Size,
  SizeProvider,
} from 'ui/metrics';
import { ThemeProvider } from 'ui/theme';
import { testMetrics } from './metrics';
import { testTheme } from './theme';

export function AllTheProviders({
  children,
  messages,
  locale,
}: PropsWithChildren<{ messages?: Messages, locale?: string }>) {
  useEffect(function () {
    if (locale != null && messages != null) {
      i18n.load(locale, messages);
      i18n.activate(locale);
    }
  }, [
    locale,
    messages,
  ]);

  const MaybeLocalizationProvider = useCallback(function ({ children }: PropsWithChildren) {
    if (messages != null && locale != null) {
      return (
        <I18nProvider i18n={i18n}>
          {children}
        </I18nProvider>
      );
    }
    return (
      <>
        {children}
      </>
    );
  }, [
    messages,
    locale,
  ]);

  return (
    <SizeProvider size={Size.Medium}>
      <MetricsProvider metrics={testMetrics}>
        <ThemeProvider theme={testTheme}>
          <MaybeLocalizationProvider>
            {children}
          </MaybeLocalizationProvider>
        </ThemeProvider>
      </MetricsProvider>
    </SizeProvider>
  );
}

function customRender(
  ui: ReactNode,
  options: RenderOptions = {},
) {
  return render(ui, {
    wrapper: AllTheProviders,
    ...options,
  });
}

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
