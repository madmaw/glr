import {
  type DiscriminatingUnionTypeDef,
  type ListTypeDef,
  type LiteralTypeDef,
  type RecordTypeDef,
  type RecordTypeDefField,
  type RecordTypeDefFields,
  type TypeDef,
  type TypeDefType,
} from './definition';

export type ReadonlyOf<F extends TypeDef> = F extends LiteralTypeDef ? ReadonlyOfLiteral<F>
  : F extends ListTypeDef ? ReadonlyOfList<F>
  : F extends RecordTypeDef ? ReadonlyOfRecord<F>
  : F extends DiscriminatingUnionTypeDef ? ReadonlyOfDiscriminatedUnion<F>
  : never;

type ReadonlyOfLiteral<F extends LiteralTypeDef> = F extends LiteralTypeDef<infer V> ? {
    type: TypeDefType.Literal,
    value: V,
  }
  : never;

type ReadonlyOfList<F extends ListTypeDef> = F extends ListTypeDef<infer E> ? {
    type: TypeDefType.List,
    elements: ReadonlyOf<E>,
    readonly: true,
  }
  : never;

type ReadonlyOfRecordField<
  F extends RecordTypeDefField,
> = F extends RecordTypeDefField<
  infer V,
  infer _Readonly,
  infer Optional
> ? RecordTypeDefField<ReadonlyOf<V>, true, Optional>
  : never;

type ReadonlyOfRecordFields<F extends RecordTypeDefFields> = {
  [K in keyof F]: ReadonlyOfRecordField<F[K]>;
};

type ReadonlyOfRecord<F extends RecordTypeDef> = F extends RecordTypeDef<infer Fields> ? {
    type: TypeDefType.Record,
    fields: ReadonlyOfRecordFields<Fields>,
  }
  : never;

type ReadonlyOfDiscriminatedUnion<
  F extends DiscriminatingUnionTypeDef,
> = F extends DiscriminatingUnionTypeDef<infer D, infer U> ? {
    readonly type: TypeDefType.DiscriminatingUnion,
    readonly discriminator: D,
    readonly unions: {
      [K in keyof U]: U[K] extends RecordTypeDefFields ? ReadonlyOfRecordFields<U[K]>
        : never;
    },
  }
  : never;
