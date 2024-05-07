import {
  render,
  type RenderOptions,
} from '@testing-library/react';
import messages from 'app/pages/example/locales/en';
import { createPartialComponent } from 'base/react/partial';
import { type ReactNode } from 'react';
import { AllTheProviders } from 'testing/react';

const AllTheProvidersWithLocale = createPartialComponent(AllTheProviders, {
  locale: 'en',
  messages,
});

export function customRender(
  ui: ReactNode,
  options: RenderOptions = {},
) {
  return render(ui, {
    wrapper: AllTheProvidersWithLocale,
    ...options,
  });
}

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
