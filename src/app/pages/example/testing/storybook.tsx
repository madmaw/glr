// import messages from 'app/pages/example/locales/en';
import {
  LocaleConsumer as BaseLocaleConsumer,
  type LocaleConsumerProps,
} from 'testing/storybook';

export function LocaleConsumer<P>({
  StorybookComponent,
  ...remainder
}: Omit<LocaleConsumerProps<P>, 'messagesPath'>) {
  const TypedLocaleConsumer = BaseLocaleConsumer<P>;
  return (
    <TypedLocaleConsumer
      {
        // not sure how to convince TS this is OK without a cast
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        ...remainder as P
      }
      StorybookComponent={StorybookComponent}
      messagesPath='app/pages/example/locales'
    />
  );
}
