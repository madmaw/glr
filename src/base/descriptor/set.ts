import { observable } from 'mobx';
import { type Descriptor } from './types';

export class SetDescriptor<R, M> implements Descriptor<ReadonlySet<R>, Set<M>> {
  aMutable!: Set<M>;

  aReadonly!: ReadonlySet<R>;

  constructor(private readonly descriptor: Descriptor<R, M>) {
  }

  create(proto: ReadonlySet<R>): Set<M> {
    return observable.set([...proto].map(r => {
      return this.descriptor.create(r);
    }));
  }
}
