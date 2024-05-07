import {
  action,
  computed,
  observable,
  runInAction,
} from 'mobx';
import {
  type AsyncLoadingState,
  type AsyncState,
  AsyncStateType,
  type AsyncSuccessState,
  isFailureState,
  isSuccessState,
} from 'ui/components/async/types';

export type CompositeAsyncController<Value, Reason, Progress> = {
  append(state: AsyncState<Value, Reason, Progress>): () => void,

  readonly state: AsyncState<Value, Reason, Progress>,
};

export class CompositeAsyncPresenter<Value, Reason, Progress> {
  constructor() {
  }

  @action
  append(
    model: CompositeAsyncModel<Value, Reason, Progress>,
    state: AsyncState<Value, Reason, Progress>,
  ): () => void {
    model.states.push(state);
    return function () {
      const index = model.states.indexOf(state);
      if (index >= 0) {
        runInAction(function () {
          model.states.splice(index, 1);
        });
      }
    };
  }

  createController(model: CompositeAsyncModel<Value, Reason, Progress>): CompositeAsyncController<
    Value,
    Reason,
    Progress
  > {
    const append = (state: AsyncState<Value, Reason, Progress>) => {
      return this.append(model, state);
    };
    return {
      append,
      get state() {
        return model.state;
      },
    };
  }
}

export class CompositeAsyncModel<
  ChildValue,
  ChildReason,
  ChildProgress,
  Value = ChildValue,
  Reason = ChildReason,
  Progress = ChildProgress,
> {
  constructor(
    private readonly combineValues: (values: readonly ChildValue[]) => Value,
    private readonly combineReasons: (reasons: readonly ChildReason[]) => Reason,
    private readonly combineProgress:
      (progress: readonly (AsyncLoadingState<ChildProgress> | AsyncSuccessState<ChildValue>)[]) => Progress,
  ) {
  }

  @observable.shallow
  accessor states: AsyncState<ChildValue, ChildReason, ChildProgress>[] = [];

  @computed
  get state(): AsyncState<Value, Reason, Progress> {
    // check for errors
    const failureStates = this.states.filter(isFailureState);
    if (failureStates.length > 0) {
      const reason = this.combineReasons(failureStates.map(function ({ reason }) {
        return reason;
      }));
      return {
        type: AsyncStateType.Failure,
        reason,
      };
    }
    const successStates = this.states.filter(isSuccessState);
    if (successStates.length === this.states.length) {
      const value = this.combineValues(successStates.map(function ({ value }) {
        return value;
      }));
      return {
        type: AsyncStateType.Success,
        value,
      };
    }

    // otherwise loading state
    const progress = this.combineProgress(
      // error states cannot appear here
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      this.states as (AsyncLoadingState<ChildProgress> | AsyncSuccessState<ChildValue>)[],
    );
    return {
      type: AsyncStateType.Loading,
      progress,
    };
  }
}
