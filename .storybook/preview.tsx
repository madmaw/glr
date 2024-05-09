import styled from '@emotion/styled';
import type { Preview } from '@storybook/react';
import { reverse } from 'base/record';
import type Color from 'colorjs.io';
import { testMetrics } from 'testing/metrics';
import {
  createSelectInputTypes,
  LocaleProvider,
} from 'testing/storybook';
import { testTheme } from 'testing/theme';
import { AsyncBoundary } from 'ui/components/async/boundary';
import {
  type Metrics,
  MetricsProvider,
  Size,
  SizeProvider,
} from 'ui/metrics';
import {
  type Theme,
  ThemeProvider,
} from 'ui/theme';

const StoryContainer = styled.div`
  label: story-container;
  position: relative;
  width: 100%;
  height: 100%;
`;

const Container = styled.div<{ backgroundColor: Color }>`
  label: preview-container;
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: ${({ backgroundColor }) => backgroundColor.toString()};
`;

const sizeLabels: Record<Size, string> = {
  [Size.Small]: 'Small',
  [Size.Medium]: 'Medium',
  [Size.Large]: 'Large',
};

const preview: Preview = {
  args: {
    theme: testTheme,
    size: Size.Medium,
    metrics: testMetrics,
    locale: 'en',
  },
  argTypes: {
    // TODO complains Theme has a cycle in it (probably due to color object). Claims can be fixed
    // by supplying mapping, however we do this here and it still complains
    // TODO different themes for different modes
    theme: createSelectInputTypes({
      ['Light']: testTheme,
      ['Dark']: testTheme,
    }),
    // TODO different metrics for different modes
    metrics: createSelectInputTypes({
      ['Desktop']: testMetrics,
      ['Mobile']: testMetrics,
    }),
    size: createSelectInputTypes(reverse(sizeLabels)),
    locale: createSelectInputTypes({
      en: 'en',
    }),
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'fullscreen',
  },
  decorators: [
    function (Story, {
      args,
    }) {
      const {
        theme,
        size,
        metrics,
        locale,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      } = args as {
        theme: Theme,
        size: Size,
        metrics: Record<Size, Metrics>,
        locale: string,
      };
      return (
        <Container backgroundColor={theme.background}>
          <StoryContainer>
            <ThemeProvider theme={theme}>
              <MetricsProvider metrics={metrics}>
                <SizeProvider size={size}>
                  <LocaleProvider value={locale}>
                    <AsyncBoundary>
                      <Story />
                    </AsyncBoundary>
                  </LocaleProvider>
                </SizeProvider>
              </MetricsProvider>
            </ThemeProvider>
          </StoryContainer>
        </Container>
      );
    },
  ],
};

export default preview;
