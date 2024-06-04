import {
  type ComponentType,
  type PropsWithChildren,
} from 'react';

import {
  type DocumentId,
  type ImageId,
} from 'app/domain/model';

export const enum RouteType {
  Home = 'home',
  View = 'view',
  Edit = 'edit',
}

export type HomeRoute = {
  readonly type: RouteType.Home,
};

export type ViewRoute = {
  readonly type: RouteType.View,
  readonly documentId: DocumentId,
  readonly imageId: ImageId,
};

export type EditRoute = {
  readonly type: RouteType.Edit,
  readonly documentId: DocumentId,
};

export type Route = HomeRoute | ViewRoute | EditRoute;

export type InitializerProps = PropsWithChildren<{
  initialize?: () => Promise<(() => void) | undefined>,
}>;

export type Initializer = ComponentType<InitializerProps>;

export type PageProps<PageRoute extends Route = Route> = {
  readonly locales: readonly string[],
  readonly route: PageRoute,
};

export type Page = {
  readonly Component: React.ComponentType<PageProps>,
};
