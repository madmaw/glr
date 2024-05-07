import { type Messages } from '@lingui/core';
import {
  type ComponentType,
  type PropsWithChildren,
} from 'react';

export type LinguiProviderProps = PropsWithChildren<{
  loadMessages: (locale: string) => Promise<Messages>,
  locales: readonly string[],
}>;

export type LinguiProvider = ComponentType<LinguiProviderProps>;
