import { createSimplePartialComponent } from 'base/react/partial';
import {
  observable,
  runInAction,
} from 'mobx';
import {
  type ComponentType,
  type FunctionComponent,
  type PropsWithChildren,
} from 'react';
import { Alignment } from 'ui/alignment';
import { Aligner } from 'ui/components/aligner';
import { CustomAsync as CustomAsyncImpl } from 'ui/components/async/custom';
import {
  AlertIcon,
  SpinnerIcon,
} from 'ui/components/icon/icons';
import { RenderChildren } from 'ui/components/render_children';
import { Typography } from 'ui/typography';
import {
  type AsyncState,
  AsyncStateType,
} from './types';

export type GenericAsyncProps<Value> = PropsWithChildren<{
  state: AsyncState<Value, void, void>,
  Success?: ComponentType<PropsWithChildren<{ value: Value }>>,
}>;

// note: has to be typed as FunctionComponent to convince
// TS that it doesn't need an explicit { reason: void } prop
const Failure: FunctionComponent = createSimplePartialComponent(
  Aligner,
  {
    xAlignment: Alignment.Middle,
    yAlignment: Alignment.Middle,
    children: <AlertIcon type={Typography.Heading} />,
  },
);

const Loading: FunctionComponent = createSimplePartialComponent(
  Aligner,
  {
    xAlignment: Alignment.Middle,
    yAlignment: Alignment.Middle,
    children: <SpinnerIcon type={Typography.Heading} />,
  },
);

export function GenericAsync<Value = void>({
  children,
  state,
  Success = RenderChildren,
}: GenericAsyncProps<Value>) {
  const CustomAsync = CustomAsyncImpl<Value>;

  return (
    <CustomAsync
      state={state}
      Failure={Failure}
      Loading={Loading}
      Success={Success}
    >
      {children}
    </CustomAsync>
  );
}

export abstract class GenericAsyncPresenter<Value, Model extends GenericAsyncModel<Value>> {
  constructor() {
  }

  async load(model: Model) {
    runInAction(function () {
      model.state = {
        type: AsyncStateType.Loading,
        progress: undefined,
      };
    });
    try {
      const value = await this.doLoadValue(model);
      runInAction(function () {
        model.state = {
          type: AsyncStateType.Success,
          value,
        };
      });
    } catch (e: unknown) {
      runInAction(function () {
        model.state = {
          type: AsyncStateType.Failure,
          reason: undefined,
        };
      });
      // rethrow as we don't report the error
      throw e;
    }
  }

  protected abstract doLoadValue(model: Model): Promise<Value>;
}

export class GenericAsyncModel<Value> {
  @observable.ref
  accessor state: AsyncState<Value, void, void> = {
    type: AsyncStateType.Loading,
    progress: undefined,
  };
}
