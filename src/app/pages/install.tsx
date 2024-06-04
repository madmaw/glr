import { type Services } from 'app/services/types';
import { type RoutingContext } from 'app/types';
import { type LinguiProvider } from 'app/ui/lingui/types';
import { UnreachableError } from 'base/unreachable_error';
import { install as installEdit } from './edit/install';
import { install as installHome } from './home/install';
import {
  type PageProps,
  RouteType,
} from './types';
import { install as installView } from './view/install';

export function install({
  services,
  LinguiProvider,
}: {
  context: RoutingContext,
  services: Services,
  LinguiProvider: LinguiProvider,
}) {
  const Edit = installEdit({
    services,
    LinguiProvider,
  });
  const View = installView({
    services,
    LinguiProvider,
  });
  const Home = installHome({
    services,
    LinguiProvider,
  });

  return function ({
    locales,
    route,
  }: PageProps) {
    switch (route.type) {
      case RouteType.Edit:
        return (
          <Edit
            route={route}
            locales={locales}
          />
        );
      case RouteType.View:
        return (
          <View
            route={route}
            locales={locales}
          />
        );
      case RouteType.Home:
        return (
          <Home
            route={route}
            locales={locales}
          />
        );
      default:
        throw new UnreachableError(route);
    }
  };
}
