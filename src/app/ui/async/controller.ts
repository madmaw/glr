import { type AsyncState } from 'ui/components/async/types';

export type AsyncModel<Value, Reason, Progress> = {
  state: AsyncState<Value, Reason, Progress>,
};

export type CompositeAsyncController<Value, Reason, Progress> = {
  append(state: AsyncState<Value, Reason, Progress>): () => void,

  readonly state: AsyncState<Value, Reason, Progress>,
};
