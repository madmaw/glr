import { exists } from 'base/exists';
import { type Dimension2 } from 'base/geometry/dimension';
import { type Rectangle2 } from 'base/geometry/rectangle';
import {
  type Observable,
  Subject,
  type Subscription,
} from 'rxjs';

export type Target = HTMLCanvasElement | HTMLImageElement;

export const enum InputUpdateType {
  Rerender,
}

export type InputUpdate = {
  type: InputUpdateType.Rerender,
  bounds: Rectangle2,
};

export type Input = {
  readonly target: Target,

  readonly updates: Observable<InputUpdate>,
};

export type Step<Parameters> = Input & {
  update(parameters: Parameters): void,

  destroy(): void,
};

export abstract class AbstractStep<Inputs extends Record<string, Input | undefined>, Parameters>
  implements Step<Parameters>
{
  readonly updates: Subject<InputUpdate>;
  private readonly subscriptions: readonly Subscription[];

  abstract readonly target: Target;
  protected abstract get width(): number;
  protected abstract get height(): number;

  constructor(protected readonly inputs: Inputs) {
    this.updates = new Subject();
    this.subscriptions = Object.values(this.inputs).map(input => {
      return input?.updates.subscribe(this.fireUpdate.bind(this));
    }).filter(exists);
  }

  destroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  resize(size: Dimension2): void {
    this.doResizeTarget(size);
    // TODO will cause unnecessary renders on resizing
    this.fireRerender();
    this.render();
  }

  protected abstract doResizeTarget(size: Dimension2): void;

  update(parameters: Parameters): void {
    this.doUpdateTarget(parameters);
    this.fireRerender();
  }

  protected abstract doUpdateTarget(parameters: Parameters): void;

  protected abstract render(): void;

  protected fireUpdate(update: InputUpdate) {
    this.updates.next(update);
  }

  protected fireRerender(bounds: Rectangle2 = {
    x: 0,
    y: 0,
    width: this.width,
    height: this.height,
  }) {
    this.fireUpdate({
      type: InputUpdateType.Rerender,
      bounds,
    });
  }
}
