import { type Messages } from '@lingui/core';

declare module '*.po' {
  const value: Messages;
  export = value;
}
