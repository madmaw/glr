import { useRef } from 'react';

// TODO although this is a ref, because it's hidden in useConstant here
// eslint will demand that the result be included in the list of deps
export function useConstant<T>(value: T): T {
  const ref = useRef(value);
  return ref.current;
}

type DeferredValue<T> = {
  type: 'unset',
} | {
  type: 'set',
  value: T,
};

// TODO although this is a ref, because it's hidden in useConstant here
// eslint will demand that the result be included in the list of deps
export function useDeferredConstant<T>(factory: () => T): T {
  const ref = useRef<DeferredValue<T>>({
    type: 'unset',
  });
  if (ref.current.type === 'unset') {
    ref.current = {
      type: 'set',
      value: factory(),
    };
  }
  return ref.current.value;
}
