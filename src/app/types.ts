export const enum RouteType {
  Example = 'example',
}

export type ExampleRoute = {
  type: RouteType.Example,
};

export type Route = ExampleRoute;

export type RoutingContext = {
  environment: 'local',
  debug: boolean,
};
