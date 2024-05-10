import {
  type Meta,
  type StoryObj,
} from '@storybook/react';
import { install } from 'app/pages/example/install';
import { MESSAGES_PATH } from 'app/pages/example/testing/storybook';
import { LocalExpressionService } from 'app/services/local/expression';
import { ConsoleLoggingService } from 'app/services/local/logging';
import { type LinguiProviderProps } from 'app/ui/lingui/types';
import { checkUnary } from 'base/preconditions';
import { useContext } from 'react';
import {
  createStorybookLoadMessages,
  StorybookLinguiProvider,
  storybookLocaleContext,
} from 'testing/storybook';

function LinguiProvider({
  locales,
  loadMessages,
  children,
}: LinguiProviderProps) {
  return (
    <StorybookLinguiProvider
      locale={checkUnary(locales, 'expected single locale, got: {0}', locales.join())}
      loadMessages={loadMessages}
    >
      {children}
    </StorybookLinguiProvider>
  );
}

const loggingService = new ConsoleLoggingService({});
const {
  Component,
} = install({
  LinguiProvider,
  services: {
    expressionService: new LocalExpressionService(loggingService, 100),
    loggingService,
  },
  loadMessages: createStorybookLoadMessages(MESSAGES_PATH),
});

function WrappedComponent() {
  const locale = useContext(storybookLocaleContext);
  return <Component locales={[locale]} />;
}

const meta: Meta<typeof WrappedComponent> = {
  component: WrappedComponent,
};
export default meta;

type Story = StoryObj<typeof WrappedComponent>;

export const PageComponent: Story = {
  args: {},
};
