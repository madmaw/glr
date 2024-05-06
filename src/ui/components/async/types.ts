export const enum AsyncStateType {
  Success = 1,
  Failure,
  Loading,
}

export type AsyncFailureState<Reason> = {
  readonly type: AsyncStateType.Failure,
  readonly reason: Reason,
};

export type AsyncSuccessState<Value> = {
  readonly type: AsyncStateType.Success,
  readonly value: Value,
};

export type AsyncLoadingState<Progress> = {
  readonly type: AsyncStateType.Loading,
  readonly progress: Progress,
};

export type AsyncState<Value, Reason, Progress> =
  | AsyncSuccessState<Value>
  | AsyncFailureState<Reason>
  | AsyncLoadingState<Progress>;

export function isSuccessState<
  Value,
  Reason,
  Progress,
>(state: AsyncState<Value, Reason, Progress>): state is AsyncSuccessState<Value> {
  return state.type === AsyncStateType.Success;
}

export function isFailureState<
  Value,
  Reason,
  Progress,
>(state: AsyncState<Value, Reason, Progress>): state is AsyncFailureState<Reason> {
  return state.type === AsyncStateType.Failure;
}

export function isLoadingState<
  Value,
  Reason,
  Progress,
>(state: AsyncState<Value, Reason, Progress>): state is AsyncLoadingState<Progress> {
  return state.type === AsyncStateType.Loading;
}
