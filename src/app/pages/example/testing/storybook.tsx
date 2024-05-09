// import messages from 'app/pages/example/locales/en';
import { createPartialComponent } from 'base/react/partial';
import { StorybookLocaleConsumer as BaseStorybookLocaleConsumer } from 'testing/storybook';

export const StorybookLocaleConsumer = createPartialComponent(BaseStorybookLocaleConsumer, {
  messagesPath: 'app/pages/example/locales',
});
