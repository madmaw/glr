import {
  type DiscriminatingUnionTypeDef,
  type ListTypeDef,
  type LiteralTypeDef,
  type NullableTypeDef,
  type RecordTypeDef,
  type RecordTypeDefField,
  type RecordTypeDefFields,
  type TypeDef,
} from './definition';

export type ValueTypeOf<F extends TypeDef, Extra = {}> = F extends LiteralTypeDef ? ValueTypeOfLiteral<F>
  : F extends NullableTypeDef ? ValueTypeOfNullable<F, Extra>
  : F extends ListTypeDef ? ValueTypeOfList<F, Extra>
  : F extends RecordTypeDef ? ValueTypeOfRecord<F, Extra>
  : F extends DiscriminatingUnionTypeDef ? ValueTypeOfDiscriminatingUnion<F, Extra>
  : never;

type ValueTypeOfLiteral<F extends LiteralTypeDef> = F['value'];

type ValueTypeOfNullable<
  F extends NullableTypeDef,
  Extra,
> = ValueTypeOf<F['nonNullableTypeDef'], Extra> | null;

export type ValueTypeOfList<F extends ListTypeDef, Extra> =
  & (F['readonly'] extends true ? readonly ValueTypeOf<F['elements']>[]
    : ValueTypeOf<F['elements']>[])
  & (Extra);

type MutableValueTypesOfFields<F extends RecordTypeDefFields> = {
  readonly [K in keyof F as F[K] extends RecordTypeDefField<TypeDef, false, false> ? K : never]: F[K]['valueType'];
};

type MutableOptionalValueTypesOfFields<F extends RecordTypeDefFields> = {
  readonly [K in keyof F as F[K] extends RecordTypeDefField<TypeDef, false, true> ? K : never]: F[K]['valueType'];
};

type ReadonlyValueTypesOfFields<F extends RecordTypeDefFields> = {
  readonly [K in keyof F as F[K] extends RecordTypeDefField<TypeDef, true, false> ? K : never]: F[K]['valueType'];
};

type ReadonlyOptionalValueTypesOfFields<F extends RecordTypeDefFields> = {
  readonly [K in keyof F as F[K] extends RecordTypeDefField<TypeDef, true, true> ? K : never]: F[K]['valueType'];
};

export type ValueTypeOfRecord<
  F extends RecordTypeDef,
  Extra,
> = ValueTypeOfRecordFields<F['fields'], Extra>;

export type ValueTypeOfRecordFields<
  F extends RecordTypeDefFields,
  Extra,
> = F extends RecordTypeDefFields ?
    & {
      -readonly [K in keyof MutableValueTypesOfFields<F>]-?: ValueTypeOf<
        MutableValueTypesOfFields<F>[K],
        Extra
      >;
    }
    & {
      -readonly [K in keyof MutableOptionalValueTypesOfFields<F>]?: ValueTypeOf<
        MutableOptionalValueTypesOfFields<F>[K],
        Extra
      >;
    }
    & {
      readonly [K in keyof ReadonlyValueTypesOfFields<F>]-?: ValueTypeOf<
        ReadonlyValueTypesOfFields<F>[K],
        Extra
      >;
    }
    & {
      readonly [K in keyof ReadonlyOptionalValueTypesOfFields<F>]?: ValueTypeOf<
        ReadonlyOptionalValueTypesOfFields<F>[K],
        Extra
      >;
    }
    & Extra
  : never;

export type ValueTypeOfDiscriminatingUnion<
  F extends DiscriminatingUnionTypeDef,
  Extra,
> = F extends DiscriminatingUnionTypeDef<infer D, infer U> ? {
    [K in keyof U]: ValueTypeOfRecordFields<U[K], Extra> & {
      readonly [V in D]: K;
    };
  }[keyof U] & Extra
  : never;
