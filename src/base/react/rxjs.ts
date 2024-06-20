import {
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import {
  fromEvent,
  type Observer,
  type OperatorFunction,
  type PartialObserver,
  Subject,
} from 'rxjs';
import { useConstant } from './constant';

export type PropsWithEvents<E, P> = {
  events?: PartialObserver<E>,
} & P;

export function useEventsCallback<
  Name extends keyof GlobalEventHandlersEventMap,
  T,
  E extends GlobalEventHandlersEventMap[Name] = GlobalEventHandlersEventMap[Name],
>(
  operator: OperatorFunction<E, T>,
  events: PartialObserver<T> | undefined,
): (e: E) => void {
  const subject = useMemo(function () {
    return new Subject<E>();
  }, []);

  useEffect(function () {
    const subscription = subject.pipe(operator).subscribe(events);
    return subscription.unsubscribe.bind(subscription);
  }, [
    subject,
    operator,
    events,
  ]);

  return useCallback(function (e: E) {
    subject.next(e);
  }, [subject]);
}

export function useEvents<
  Name extends keyof GlobalEventHandlersEventMap,
  T,
  E extends GlobalEventHandlersEventMap[Name] = GlobalEventHandlersEventMap[Name],
>(
  name: Name,
  operator: OperatorFunction<E, T>,
  events: PartialObserver<T> | undefined,
  target: HTMLElement | null,
) {
  useEffect(function () {
    if (target != null) {
      const observable = fromEvent<E>(target, name);
      const subscription = observable.pipe(operator).subscribe(events);
      return subscription.unsubscribe.bind(subscription);
    }
  }, [
    name,
    operator,
    events,
    target,
  ]);
}

export function useObserverPipe<From, To>(
  to: PartialObserver<To>,
  operator: OperatorFunction<From, To>,
): Observer<From> {
  const subject = useConstant(new Subject<From>());
  useEffect(function () {
    const subscription = subject.pipe(operator).subscribe(to);
    return subscription.unsubscribe.bind(subscription);
  }, [
    operator,
    subject,
    to,
  ]);
  return subject;
}
