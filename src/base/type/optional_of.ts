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

export type OptionalOf<F extends TypeDef> = F extends LiteralTypeDef ? OptionalOfLiteral<F>
  : F extends ListTypeDef ? OptionalOfList<F>
  : F extends RecordTypeDef ? OptionalOfRecord<F>
  : F extends DiscriminatingUnionTypeDef ? OptionalOfDiscriminatedUnion<F>
  : never;

type OptionalOfLiteral<F extends LiteralTypeDef> = F extends LiteralTypeDef<infer V> ? {
    type: TypeDefType.Literal,
    value: V | undefined,
  }
  : never;

type OptionalOfList<F extends ListTypeDef> = F extends ListTypeDef<infer E, infer Readonly> ? {
    type: TypeDefType.List,
    // are lists of potentially undefined values appealing here?
    elements: OptionalOf<E>,
    readonly: Readonly,
  }
  : never;

type OptionalOfRecordField<
  F extends RecordTypeDefField,
> = F extends RecordTypeDefField<
  infer V,
  infer Readonly,
  infer _Optional
> ? RecordTypeDefField<OptionalOf<V>, Readonly, true>
  : never;

type OptionalOfRecordFields<
  F extends RecordTypeDefFields,
> = {
  [K in keyof F]: OptionalOfRecordField<F[K]>;
};

type OptionalOfRecord<F extends RecordTypeDef> = F extends RecordTypeDef<
  infer Fields
> ? {
    readonly type: TypeDefType.Record,
    readonly fields: OptionalOfRecordFields<Fields>,
  }
  : never;

type OptionalOfDiscriminatedUnion<F extends DiscriminatingUnionTypeDef> = F extends DiscriminatingUnionTypeDef<
  infer D,
  infer U
> ? {
    readonly type: TypeDefType.DiscriminatingUnion,
    readonly discriminator: D,
    readonly unions: {
      [K in keyof U]: U[K] extends RecordTypeDefFields ? OptionalOfRecordFields<U[K]>
        : never;
    },
  }
  : never;
