import {
  type ComponentType,
  type PropsWithChildren,
} from 'react';

export type InitializerProps = PropsWithChildren<{
  initialize?: () => Promise<(() => void) | undefined>,
}>;

export type Initializer = ComponentType<InitializerProps>;

export type PageProps = {
  readonly locales: readonly string[],
};

export type Page = {
  readonly Component: React.ComponentType<PageProps>,
};
