import {
  type DiscriminatedUnionTypeDef,
  type ListTypeDef,
  type LiteralTypeDef,
  type RecordTypeDef,
  type RecordTypeDefFields,
  type TypeDef,
  type TypeDefType,
} from './definition';

export type OptionalOf<F extends TypeDef> = F extends LiteralTypeDef ? OptionalOfLiteral<F>
  : F extends ListTypeDef ? OptionalOfList<F>
  : F extends RecordTypeDef ? OptionalOfRecord<F>
  : F extends DiscriminatedUnionTypeDef ? OptionalOfDiscriminatedUnion<F>
  : never;

type OptionalOfLiteral<F extends LiteralTypeDef> = F extends LiteralTypeDef<infer V> ? {
    type: TypeDefType.Literal,
    value?: V | undefined,
  }
  : never;

type OptionalOfList<F extends ListTypeDef> = F extends ListTypeDef<infer E, infer Readonly> ? {
    type: TypeDefType.List,
    // are lists of potentially undefined values appealing here?
    elements: OptionalOf<E>,
    readonly: Readonly,
  }
  : never;

type OptionalOfRecord<F extends RecordTypeDefFields> = F extends RecordTypeDefFields<
  infer MutableFields,
  infer MutableOptionalFields,
  infer ReadonlyFields,
  infer ReadonlyOptionalFields
> ? {
    readonly type: TypeDefType.Record,
    readonly mutableFields: {},
    readonly mutableOptionalFields: {
      [K in keyof MutableFields]: OptionalOf<MutableFields[K]>;
    } & {
      [K in keyof MutableOptionalFields]: OptionalOf<MutableOptionalFields[K]>;
    },
    readonly readonlyFields: {},
    readonly readonlyOptionalFields: {
      [K in keyof ReadonlyFields]: OptionalOf<ReadonlyFields[K]>;
    } & {
      [K in keyof ReadonlyOptionalFields]: OptionalOf<ReadonlyOptionalFields[K]>;
    },
  }
  : never;

type OptionalOfDiscriminatedUnion<F extends DiscriminatedUnionTypeDef> = F extends DiscriminatedUnionTypeDef<
  infer D,
  infer U
> ? {
    readonly type: TypeDefType.DiscriminatedUnion,
    readonly discriminator: D,
    readonly options: {
      [K in keyof U]: U[K] extends RecordTypeDefFields ? OptionalOfRecord<U[K]>
        : never;
    },
  }
  : never;
