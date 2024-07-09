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

type DefaultDepth = 21;

export type ValueTypeOf<
  F extends TypeDef,
  Extra = {},
> = InternalValueTypeOf<F, Extra, DefaultDepth>;

type InternalValueTypeOf<
  F extends TypeDef,
  Extra,
  Depth extends number,
  NextDepth extends number = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20][Depth],
> = NextDepth extends -1 ? never
  : F extends LiteralTypeDef ? ValueTypeOfLiteral<F>
  : F extends NullableTypeDef ? ValueTypeOfNullable<F, Extra, NextDepth>
  : F extends ListTypeDef ? InternalValueTypeOfList<F, Extra, NextDepth>
  : F extends RecordTypeDef ? InternalValueTypeOfRecord<F, Extra, NextDepth>
  : F extends DiscriminatingUnionTypeDef ? InternalValueTypeOfDiscriminatingUnion<F, Extra, NextDepth>
  : never;

type ValueTypeOfLiteral<F extends LiteralTypeDef> = F['value'];

type ValueTypeOfNullable<
  F extends NullableTypeDef,
  Extra,
  Depth extends number,
> = InternalValueTypeOf<F['nonNullableTypeDef'], Extra, Depth> | null;

export type ValueTypeOfList<
  F extends ListTypeDef,
  Extra = {},
> = InternalValueTypeOfList<F, Extra, DefaultDepth>;

type InternalValueTypeOfList<F extends ListTypeDef, Extra, Depth extends number> =
  & (F['readonly'] extends true ? readonly InternalValueTypeOf<F['elements'], Extra, Depth>[]
    : InternalValueTypeOf<F['elements'], Extra, Depth>[])
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
  Extra = {},
> = InternalValueTypeOfRecord<F, Extra, DefaultDepth>;

type InternalValueTypeOfRecord<
  F extends RecordTypeDef,
  Extra,
  Depth extends number,
> = InternalValueTypeOfRecordFields<F['fields'], Extra, Depth>;

export type ValueTypeOfRecordFields<
  F extends RecordTypeDefFields,
  Extra,
> = InternalValueTypeOfRecordFields<F, Extra, DefaultDepth>;

type InternalValueTypeOfRecordFields<
  F extends RecordTypeDefFields,
  Extra,
  Depth extends number,
> = F extends RecordTypeDefFields ?
    & {
      -readonly [K in keyof MutableValueTypesOfFields<F>]-?: InternalValueTypeOf<
        MutableValueTypesOfFields<F>[K],
        Extra,
        Depth
      >;
    }
    & {
      -readonly [K in keyof MutableOptionalValueTypesOfFields<F>]?: InternalValueTypeOf<
        MutableOptionalValueTypesOfFields<F>[K],
        Extra,
        Depth
      >;
    }
    & {
      readonly [K in keyof ReadonlyValueTypesOfFields<F>]-?: InternalValueTypeOf<
        ReadonlyValueTypesOfFields<F>[K],
        Extra,
        Depth
      >;
    }
    & {
      readonly [K in keyof ReadonlyOptionalValueTypesOfFields<F>]?: InternalValueTypeOf<
        ReadonlyOptionalValueTypesOfFields<F>[K],
        Extra,
        Depth
      >;
    }
    & Extra
  : never;

export type ValueTypeOfDiscriminatingUnion<
  F extends DiscriminatingUnionTypeDef,
  Extra = {},
> = InternalValueTypeOfDiscriminatingUnion<F, Extra, DefaultDepth>;

type InternalValueTypeOfDiscriminatingUnion<
  F extends DiscriminatingUnionTypeDef,
  Extra,
  Depth extends number,
> = F extends DiscriminatingUnionTypeDef<infer D, infer U> ? {
    [K in keyof U]: InternalValueTypeOfRecordFields<U[K], Extra, Depth> & {
      readonly [V in D]: K;
    };
  }[keyof U] & Extra
  : never;
