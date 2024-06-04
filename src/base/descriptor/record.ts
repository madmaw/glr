import {
  makeObservable,
  observable,
} from 'mobx';
import { type Descriptor } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Descriptors = Record<string, Descriptor<any, any>>;

type ReadonlyOf<D extends Descriptors> = {
  readonly [k in keyof D]: D[k]['aReadonly'];
};

type MutableOf<D extends Descriptors> = {
  [k in keyof D]: D[k]['aMutable'];
};

export class RecordDescriptor<D extends Descriptors> implements Descriptor<ReadonlyOf<D>, MutableOf<D>> {
  aMutable!: MutableOf<D>;

  aReadonly!: ReadonlyOf<D>;
  private readonly annotations: Record<keyof D, typeof observable>;

  constructor(readonly descriptors: D) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const annotations = {} as Record<keyof D, typeof observable>;
    for (const key in this.descriptors) {
      annotations[key] = observable;
    }
    this.annotations = annotations;
  }

  create(proto: ReadonlyOf<D>): MutableOf<D> {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const result = {} as MutableOf<D>;
    for (const key in this.descriptors) {
      const descriptor = this.descriptors[key];
      const value = proto[key];
      result[key] = descriptor.create(value);
    }

    return makeObservable<MutableOf<D>>(result, this.annotations);
  }
}
