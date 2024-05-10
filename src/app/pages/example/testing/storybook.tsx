// import messages from 'app/pages/example/locales/en';
import { createPartialComponent } from 'base/react/partial';
import { StorybookLocaleConsumer as BaseStorybookLocaleConsumer } from 'testing/storybook';

export const MESSAGES_PATH = 'app/pages/example/locales';

export const StorybookLocaleConsumer = createPartialComponent(BaseStorybookLocaleConsumer, {
  messagesPath: MESSAGES_PATH,
});
