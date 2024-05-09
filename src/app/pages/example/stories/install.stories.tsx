import {
  type Meta,
  type StoryObj,
} from '@storybook/react';
import { install } from 'app/pages/example/install';
import { StorybookLocaleConsumer } from 'app/pages/example/testing/storybook';
import { LocalExpressionService } from 'app/services/local/expression';
import { ConsoleLoggingService } from 'app/services/local/logging';
import { useContext } from 'react';
import { storybookLocaleContext } from 'testing/storybook';

const loggingService = new ConsoleLoggingService({});
const {
  Component,
} = install({
  LinguiProvider: StorybookLocaleConsumer,
  services: {
    expressionService: new LocalExpressionService(loggingService, 100),
    loggingService,
  },
});

function WrappedComponent() {
  const locale = useContext(storybookLocaleContext);
  // use pre-existing locale
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
