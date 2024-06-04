import { type Descriptor } from './types';

export class LiteralDescriptor<V> implements Descriptor<V, V> {
  aMutable!: V;

  aReadonly!: V;

  create(proto: V): V {
    return proto;
  }
}

export const numberDescriptor = new LiteralDescriptor<number>();
export const unsignedIntegerDescriptor = new LiteralDescriptor<number>();
export const stringDescriptor = new LiteralDescriptor<string>();
export const booleanDescriptor = new LiteralDescriptor<boolean>();
