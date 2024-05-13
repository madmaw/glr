import { AsyncBoundary } from 'ui/components/async/boundary';
import {
  Size,
  SizeProvider,
} from 'ui/metrics';
import { install as installPage } from './pages/install';
import { install as installServices } from './services/install';
import {
  type Route,
  RouteType,
  type RoutingContext,
} from './types';
import { install as installUI } from './ui/install';
import { Display } from './ui/metrics/types';
import { Themes } from './ui/theme/types';

export function install(_url: string) {
  // TODO routing based on current URL (and feedback current application state into browser location)
  const route: Route = {
    type: RouteType.Example,
  };
  const context: RoutingContext = {
    debug: false,
    environment: 'local',
  };

  const services = installServices({
    descriptors: {
      loggingService: context.environment,
      expressionService: context.environment,
    },
  });

  const {
    ThemeContextProvider,
    MetricsContextProvider,
    LinguiProvider,
  } = installUI(services);

  const {
    Component: PageComponent,
  } = installPage({
    route,
    context,
    services,
    LinguiProvider,
  });

  const defaultLocales = [navigator.language].concat(...(navigator.languages || []), 'en');

  return function () {
    // TODO Component should be allowed to change locale and default theme
    return (
      <SizeProvider size={Size.Large}>
        {/* TODO: theme should also have async loading of fonts */}
        <ThemeContextProvider theme={Themes.Light}>
          <MetricsContextProvider display={Display.Comfortable}>
            {/* use a generic loading component with no text so we can use it while loading fonts and i18n resources */}
            <AsyncBoundary>
              <PageComponent locales={defaultLocales} />
            </AsyncBoundary>
          </MetricsContextProvider>
        </ThemeContextProvider>
      </SizeProvider>
    );
  };
}
