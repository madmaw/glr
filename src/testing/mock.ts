import { type Mocked } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMockedInstance<T extends abstract new(...args: any) => any>(o: T): Mocked<InstanceType<T>> {
  return Object.getOwnPropertyNames(o.prototype).reduce(function (acc, key) {
    acc[key] = vitest.fn();
    return acc;
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  }, {} as Mocked<InstanceType<T>>);
}
