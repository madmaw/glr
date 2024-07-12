import {
  type MaybePartial,
  type MaybeReadonly,
} from 'base/lang';
import {
  type DiscriminatingUnionTypeDef,
  type ListTypeDef,
  type LiteralTypeDef,
  type MapTypeDef,
  type NullableTypeDef,
  type StructuredTypeDef,
  type StructuredTypeDefFields,
  type StructuredTypeField,
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
  : F extends MapTypeDef ? InternalValueTypeOfMap<F, Extra, NextDepth>
  : F extends StructuredTypeDef ? InternalValueTypeOfStruct<F, Extra, NextDepth>
  : F extends DiscriminatingUnionTypeDef ? InternalValueTypeOfDiscriminatingUnion<F, Extra, NextDepth>
  : never;

type ValueTypeOfLiteral<F extends LiteralTypeDef> = F['valuePrototype'];

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

type MutableValueTypesOfFields<F extends StructuredTypeDefFields> = {
  readonly [K in keyof F as F[K] extends StructuredTypeField<TypeDef, false, false> ? K : never]: F[K]['valueType'];
};

type MutableOptionalValueTypesOfFields<F extends StructuredTypeDefFields> = {
  readonly [K in keyof F as F[K] extends StructuredTypeField<TypeDef, false, true> ? K : never]: F[K]['valueType'];
};

type ReadonlyValueTypesOfFields<F extends StructuredTypeDefFields> = {
  readonly [K in keyof F as F[K] extends StructuredTypeField<TypeDef, true, false> ? K : never]: F[K]['valueType'];
};

type ReadonlyOptionalValueTypesOfFields<F extends StructuredTypeDefFields> = {
  readonly [K in keyof F as F[K] extends StructuredTypeField<TypeDef, true, true> ? K : never]: F[K]['valueType'];
};

type InternalValueTypeOfMap<
  F extends MapTypeDef,
  Extra,
  Depth extends number,
> = MaybePartial<MaybeReadonly<
  Record<
    F['keyPrototype'],
    InternalValueTypeOf<
      F['valueType'],
      Extra,
      Depth
    >
  >,
  F['readonly']
>, F['partial']>;

export type ValueTypeOfStruct<
  F extends StructuredTypeDef,
  Extra = {},
> = InternalValueTypeOfStruct<F, Extra, DefaultDepth>;

type InternalValueTypeOfStruct<
  F extends StructuredTypeDef,
  Extra,
  Depth extends number,
> = InternalValueTypeOfStructFields<F['fields'], Extra, Depth>;

export type ValueTypeOfStructFields<
  F extends StructuredTypeDefFields,
  Extra,
> = InternalValueTypeOfStructFields<F, Extra, DefaultDepth>;

type InternalValueTypeOfStructFields<
  F extends StructuredTypeDefFields,
  Extra,
  Depth extends number,
> = F extends StructuredTypeDefFields ?
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
    [K in keyof U]: InternalValueTypeOfStructFields<U[K], Extra, Depth> & {
      readonly [V in D]: K;
    };
  }[keyof U] & Extra
  : never;
