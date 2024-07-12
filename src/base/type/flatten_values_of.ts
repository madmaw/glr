import { type UnionToIntersection } from 'base/lang';
import { type ReadonlyRecord } from 'base/record';
import {
  type DiscriminatingUnionTypeDef,
  type ListTypeDef,
  type LiteralTypeDef,
  type NullableTypeDef,
  type StructuredTypeDef,
  type StructuredTypeField,
  type TypeDef,
} from 'base/type/definition';
import { type ValueTypeOf } from 'base/type/value_type_of';
import {
  flattenMapOfMutableValue,
  flattenMapOfValue,
} from './flatten_map_of';
import { type PrefixOf } from './prefix_of';
import { type ReadonlyOf } from './readonly_of';

type MutableFlattenedValue<T extends TypeDef, P extends string> = {
  readonly typePath: P,
  readonly value: ValueTypeOf<T>,
  readonly setValue?: (value: ValueTypeOf<T>) => void,
};

type FlattenedValue<T extends TypeDef, P extends string> = {
  readonly typePath: P,
  readonly value: ValueTypeOf<T>,
};

// causes typescript to infinitely recurse
// export type FlattenedValuesOf<
//   T extends TypeDef,
//   Prefix extends string,
//   F extends Record<string, TypeDef> = FlattenedOf<T, Prefix>,
//   P extends string | number | symbol = PathsOf<T, Prefix, 'n'>,
// > = Readonly<{
//   [K in keyof F]: FlattenedValue<F[K], P>;
// }>;

type DefaultDepth = 21;

export type FlattenedValuesOf<
  F extends TypeDef,
  Mutable extends boolean,
  ValuePrefix extends string = '',
  TypePrefix extends string = ValuePrefix,
  TypeSegmentOverride extends string = 'n',
> = InternalFlattenedOf<
  F,
  Mutable,
  ValuePrefix,
  TypePrefix,
  TypeSegmentOverride,
  DefaultDepth
>;

type InternalFlattenedOf<
  F extends TypeDef,
  Mutable extends boolean,
  ValuePrefix extends string,
  TypePrefix extends string,
  TypeSegmentOverride extends string,
  Depth extends number,
  NextDepth extends number = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20][Depth],
> = NextDepth extends -1 ? {}
  :
    & InternalFlattenedOfChildren<F, Mutable, ValuePrefix, TypePrefix, TypeSegmentOverride, NextDepth>
    & ReadonlyRecord<
      ValuePrefix,
      Mutable extends true ? MutableFlattenedValue<F, TypePrefix> : FlattenedValue<F, TypePrefix>
    >;

type InternalFlattenedOfChildren<
  F extends TypeDef,
  Mutable extends boolean,
  ValuePrefix extends string,
  TypePrefix extends string,
  TypeSegmentOverride extends string,
  Depth extends number,
> = F extends LiteralTypeDef ? FlattenedOfLiteralChildren
  : F extends NullableTypeDef ? FlattenedOfNullableChildren<
      F,
      Mutable,
      ValuePrefix,
      TypePrefix,
      TypeSegmentOverride,
      Depth
    >
  : F extends ListTypeDef ? FlattenedOfListChildren<
      F,
      Mutable,
      ValuePrefix,
      TypePrefix,
      TypeSegmentOverride,
      Depth
    >
  : F extends StructuredTypeDef ? FlattenedOfStructChildren<
      F,
      Mutable,
      ValuePrefix,
      TypePrefix,
      TypeSegmentOverride,
      Depth
    >
  : F extends DiscriminatingUnionTypeDef ? FlattenedOfDiscriminatingUnionChildren<
      F,
      Mutable,
      ValuePrefix,
      TypePrefix,
      TypeSegmentOverride,
      Depth
    >
  : never;

type FlattenedOfLiteralChildren = {};

type FlattenedOfNullableChildren<
  F extends NullableTypeDef,
  Mutable extends boolean,
  ValuePrefix extends string,
  TypePrefix extends string,
  TypeSegmentOverride extends string,
  Depth extends number,
> = Partial<InternalFlattenedOfChildren<
  F['nonNullableTypeDef'],
  Mutable,
  ValuePrefix,
  TypePrefix,
  TypeSegmentOverride,
  Depth
>>;

type FlattenedOfListChildren<
  F extends ListTypeDef,
  Mutable extends boolean,
  ValuePrefix extends string,
  TypePrefix extends string,
  TypeSegmentOverride extends string,
  Depth extends number,
> = InternalFlattenedOf<
  F['elements'],
  Mutable,
  PrefixOf<
    ValuePrefix,
    number
  >,
  PrefixOf<
    TypePrefix,
    TypeSegmentOverride
  >,
  TypeSegmentOverride,
  Depth
>;

type FlattenedOfStructFieldGroup<
  Fields extends Record<string, StructuredTypeField>,
  Mutable extends boolean,
  ValuePrefix extends string,
  TypePrefix extends string,
  TypeSegmentOverride extends string,
  Depth extends number,
> =
  // if it's empty, then iterating the fields returns never, not an empty set, so
  // we need special handling for this
  {} extends Fields ? {}
    : UnionToIntersection<{
      readonly [K in keyof Fields]: Fields[K]['optional'] extends true ? Partial<
          InternalFlattenedOf<
            Fields[K]['valueType'],
            Mutable,
            PrefixOf<ValuePrefix, K>,
            PrefixOf<TypePrefix, K>,
            TypeSegmentOverride,
            Depth
          >
        >
        : InternalFlattenedOf<
          Fields[K]['valueType'],
          Mutable,
          PrefixOf<ValuePrefix, K>,
          PrefixOf<TypePrefix, K>,
          TypeSegmentOverride,
          Depth
        >;
    }[keyof Fields]>;

type FlattenedOfStructChildren<
  F extends StructuredTypeDef,
  Mutable extends boolean,
  ValuePrefix extends string,
  TypePrefix extends string,
  TypeSegmentOverride extends string,
  Depth extends number,
> = FlattenedOfStructFieldGroup<
  F['fields'],
  Mutable,
  ValuePrefix,
  TypePrefix,
  TypeSegmentOverride,
  Depth
>;

type FlattenedOfDiscriminatingUnionChildren<
  F extends DiscriminatingUnionTypeDef,
  Mutable extends boolean,
  ValuePrefix extends string,
  TypePrefix extends string,
  TypeSegmentOverride extends string,
  Depth extends number,
> =
  & Partial<UnionToIntersection<
    {
      readonly [K in keyof F['unions']]: FlattenedOfStructFieldGroup<
        F['unions'][K],
        Mutable,
        PrefixOf<ValuePrefix, K>,
        PrefixOf<TypePrefix, K>,
        TypeSegmentOverride,
        Depth
      >;
      // do not synthesize a type for PrefixOf<Prefix, K>
      // & ReadonlyRecord<
      //   PrefixOf<ValuePrefix, K>,
      //   FlattenedValue<RecordTypeDef<F['unions'][K]>, PrefixOf<TypePrefix, K>>
      // >;
    }[keyof F['unions']]
  >>
  // include the discriminator
  & {
    readonly [K in PrefixOf<ValuePrefix, F['discriminator']>]: FlattenedValue<
      LiteralTypeDef<keyof F['unions']>,
      PrefixOf<TypePrefix, F['discriminator']>
    >;
  };

type InternalFlattenedValue = {
  readonly typePath: string,
  readonly value: ValueTypeOf<TypeDef>,
  readonly setValue?: (value: ValueTypeOf<TypeDef>) => void,
};

export function flattenValuesOf<
  T extends TypeDef,
  Prefix extends string,
>(
  def: T,
  v: ValueTypeOf<ReadonlyOf<T>>,
  prefix: Prefix,
): FlattenedValuesOf<T, false, Prefix> {
  // cast to type-safe value
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return flattenMapOfValue<T, InternalFlattenedValue, Prefix>(
    def,
    v,
    function (_def: T, _valuePath: string, typePath: string, value: ValueTypeOf<T>) {
      return {
        typePath,
        value,
      };
    },
    prefix,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any;
}

export function flattenMutableValuesOf<
  T extends TypeDef,
  Prefix extends string,
>(
  def: T,
  v: ValueTypeOf<T>,
  prefix: Prefix,
): FlattenedValuesOf<T, true, Prefix> {
  // cast to type-safe value
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return flattenMapOfMutableValue<T, InternalFlattenedValue, Prefix>(
    def,
    v,
    function (
      _def: T,
      _valuePath: string,
      typePath: string,
      value: ValueTypeOf<T>,
      setValue: (value: ValueTypeOf<T>) => void,
    ) {
      return {
        typePath,
        value,
        setValue,
      };
    },
    prefix,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any;
}
