import { checkExists } from 'base/preconditions';
import { useObserverComponent } from 'base/react/mobx';
import {
  type ComponentType,
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import {
  GenericAsync,
  type GenericAsyncProps,
} from 'ui/components/async/generic';
import {
  type AsyncState,
  AsyncStateType,
} from 'ui/components/async/types';
import { Overlayer } from 'ui/components/overlayer';
import { RenderChildren } from 'ui/components/render_children';
import {
  type CompositeAsyncController,
  CompositeAsyncModel,
  CompositeAsyncPresenter,
} from './internal/composite_presenter';

const context = createContext<CompositeAsyncController<unknown, void, void> | null>(null);

const presenter = new CompositeAsyncPresenter<void, void, void>();

function toVoid(): void {
}

export function AsyncBoundaryOnly({ children }: PropsWithChildren) {
  const { Provider } = context;

  const controller = useMemo(function () {
    const model = new CompositeAsyncModel<void, void, void>(
      toVoid,
      toVoid,
      toVoid,
    );
    return presenter.createController(model);
  }, []);

  return (
    <Provider value={controller}>
      {children}
    </Provider>
  );
}

export type AsyncBoundaryDisplayProps = PropsWithChildren<{
  Async?: ComponentType<GenericAsyncProps<unknown>>,
}>;

export function AsyncBoundaryDisplay({
  children,
  Async = GenericAsync,
}: AsyncBoundaryDisplayProps) {
  const controller = checkExists(useContext(context), 'must have an async context');
  const MaybeObservingAsync = useObserverComponent(function () {
    const state = controller.state;
    if (state.type !== AsyncStateType.Success) {
      return <Async state={state} />;
    }
  }, [
    Async,
    controller,
  ]);
  // TODO suspect unmounting the children on means the child models never get created
  return (
    <Overlayer>
      <MaybeObservingAsync />
      {children}
    </Overlayer>
  );
}

export function AsyncBoundary({
  children,
  Async,
}: AsyncBoundaryDisplayProps) {
  return (
    <AsyncBoundaryOnly>
      <AsyncBoundaryDisplay Async={Async}>
        {children}
      </AsyncBoundaryDisplay>
    </AsyncBoundaryOnly>
  );
}

/**
 * Adds the supplied state to the async boundary
 */
export function AsyncBoundaryDelegate<V = void>({
  state,
  children,
  Success = RenderChildren,
  FallbackAsync = GenericAsync<V>,
}: PropsWithChildren<{
  state: AsyncState<V, void, void>,
  Success?: ComponentType<PropsWithChildren<{ value: V }>>,
  FallbackAsync?: ComponentType<GenericAsyncProps<V>>,
}>) {
  const controller = useContext(context);
  useEffect(function () {
    if (controller != null) {
      // delegate to our parent
      return controller.append(state);
    }
  }, [
    controller,
    state,
  ]);
  if (controller == null) {
    // host a fallback async right here if there is no context
    return (
      <FallbackAsync
        state={state}
        Success={Success}
      >
        {children}
      </FallbackAsync>
    );
  }
  // only render the children if the local render has succeeded (in this way we can cascade
  // nested AsyncBoundaryDelegates if we have to)
  if (state.type === AsyncStateType.Success) {
    return (
      <Success value={state.value}>
        {children}
      </Success>
    );
  }
  return null;
}
