import { type Descriptor } from './types';

export class OptionalDescriptor<R, M> implements Descriptor<R | undefined, M | undefined> {
  aMutable!: M | undefined;

  aReadonly!: R | undefined;

  constructor(private readonly descriptor: Descriptor<R, M>) {
  }

  create(proto: R | undefined): M | undefined {
    return proto !== undefined
      ? this.descriptor.create(proto)
      : undefined;
  }
}
