import { type Services } from 'app/services/types';
import {
  type Route,
  RouteType,
  type RoutingContext,
} from 'app/types';
import { type LinguiProvider } from 'app/ui/lingui/types';
import { UnreachableError } from 'base/unreachable_error';
import { install as installExample } from './example/install';

export function install({
  route,
  services,
  LinguiProvider,
}: {
  route: Route,
  context: RoutingContext,
  services: Services,
  LinguiProvider: LinguiProvider,
}) {
  switch (route.type) {
    case RouteType.Example:
      return installExample({
        services,
        LinguiProvider,
      });
    default:
      throw new UnreachableError(route.type);
  }
}
