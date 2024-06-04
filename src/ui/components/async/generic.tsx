import { createPartialComponent } from 'base/react/partial';
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
import { type AsyncState } from './types';

export type GenericAsyncProps<Value> = PropsWithChildren<{
  state: AsyncState<Value, void, void>,
  Success?: ComponentType<PropsWithChildren<{ value: Value }>>,
}>;

// note: has to be typed as FunctionComponent to convince
// TS that it doesn't need an explicit { reason: void } prop
const Failure: FunctionComponent = createPartialComponent(
  Aligner,
  {
    xAlignment: Alignment.Middle,
    yAlignment: Alignment.Middle,
    children: <AlertIcon type={Typography.Heading} />,
  },
);

const Loading: FunctionComponent = createPartialComponent(
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
