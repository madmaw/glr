import {
  type DiscriminatedUnionTypeDef,
  type ListTypeDef,
  type LiteralTypeDef,
  type RecordTypeDef,
  type RecordTypeDefFields,
  type TypeDef,
  type TypeDefType,
} from './definition';

export type ReadonlyOf<F extends TypeDef> = F extends LiteralTypeDef ? ReadonlyOfLiteral<F>
  : F extends ListTypeDef ? ReadonlyOfList<F>
  : F extends RecordTypeDef ? ReadonlyOfRecord<F>
  : F extends DiscriminatedUnionTypeDef ? ReadonlyOfDiscriminatedUnion<F>
  : never;

type ReadonlyOfLiteral<F extends LiteralTypeDef> = F extends LiteralTypeDef<infer V> ? {
    type: TypeDefType.Literal,
    value?: V,
  }
  : never;

export type ReadonlyOfList<F extends ListTypeDef> = F extends ListTypeDef<infer E> ? {
    type: TypeDefType.List,
    elements: ReadonlyOf<E>,
    readonly: true,
  }
  : never;

type ReadonlyOfRecord<F extends RecordTypeDefFields> = F extends RecordTypeDefFields<
  infer MutableFields,
  infer MutableOptionalFields,
  infer ReadonlyFields,
  infer ReadonlyOptionalFields
> ? {
    readonly type: TypeDefType.Record,
    readonly mutableFields: {},
    readonly mutableOptionalFields: {},
    readonly readonlyFields: {
      [K in keyof ReadonlyFields]: ReadonlyOf<ReadonlyFields[K]>;
    } & {
      [K in keyof MutableFields]: ReadonlyOf<MutableFields[K]>;
    },
    readonly readonlyOptionalFields: {
      [K in keyof ReadonlyOptionalFields]: ReadonlyOf<ReadonlyOptionalFields[K]>;
    } & {
      [K in keyof MutableOptionalFields]: ReadonlyOf<MutableOptionalFields[K]>;
    },
  }
  : never;

type ReadonlyOfDiscriminatedUnion<
  F extends DiscriminatedUnionTypeDef,
> = F extends DiscriminatedUnionTypeDef<infer D, infer U> ? {
    readonly type: TypeDefType.DiscriminatedUnion,
    readonly discriminator: D,
    readonly options: {
      [K in keyof U]: U[K] extends RecordTypeDefFields ? ReadonlyOfRecord<U[K]>
        : never;
    },
  }
  : never;
