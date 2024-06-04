import { observable } from 'mobx';
import { type Descriptor } from './types';

export class ListDescriptor<R, M> implements Descriptor<readonly R[], M[]> {
  aMutable!: M[];

  aReadonly!: readonly R[];

  constructor(private readonly descriptor: Descriptor<R, M>) {
  }

  create(proto: readonly R[]): M[] {
    const a = proto.map(r => {
      return this.descriptor.create(r);
    });
    return observable(a);
  }
}
