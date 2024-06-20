import Format from 'string-format';

export type FormattingArg = string | number | boolean | null | undefined;

class PreconditionFailedError extends Error {
  constructor(message: string, args: readonly FormattingArg[]) {
    super(Format(message, args));
    this.name = 'PreconditionFailedError';
  }
}

export function checkExists<T>(
  t: T | null | undefined,
  message: string,
  ...args: readonly FormattingArg[]
): NonNullable<T> {
  if (t == null) {
    throw new PreconditionFailedError(message, args);
  }
  return t;
}

export function checkState(
  condition: boolean,
  message: string,
  ...args: readonly FormattingArg[]
): asserts condition is true {
  if (!condition) {
    throw new PreconditionFailedError(message, args);
  }
}

export function checkUnary<T>(
  t: readonly T[],
  message: string,
  ...args: readonly FormattingArg[]
): T {
  if (t.length !== 1) {
    throw new PreconditionFailedError(message, args);
  }
  return t[0];
}
