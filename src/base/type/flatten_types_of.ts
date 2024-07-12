import { type UnionToIntersection } from 'base/lang';
import { type ReadonlyRecord } from 'base/record';
import {
  type DiscriminatingUnionTypeDef,
  type ListTypeDef,
  type LiteralTypeDef,
  type NullableTypeDef,
  type StructuredTypeDef,
  type StructuredTypeDefFields,
  type StructuredTypeField,
  type TypeDef,
} from './definition';
import { flattenMapOfType } from './flatten_map_of';
import { type PrefixOf } from './prefix_of';

type DefaultDepth = 21;

export type FlattenedOf<
  F extends TypeDef,
  Prefix extends string = '',
  VariableSegmentOverride extends string | undefined = undefined,
> = InternalFlattenedOf<F, Prefix, VariableSegmentOverride, DefaultDepth>;

type InternalFlattenedOf<
  F extends TypeDef,
  Prefix extends string,
  VariableSegmentOverride extends string | undefined,
  Depth extends number,
  NextDepth extends number = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20][Depth],
> = NextDepth extends -1 ? {}
  :
    & InternalFlattenedOfChildren<F, Prefix, VariableSegmentOverride, NextDepth>
    & ReadonlyRecord<Prefix, F>;

type InternalFlattenedOfChildren<
  F extends TypeDef,
  Prefix extends string,
  VariableSegmentOverride extends string | undefined,
  Depth extends number,
> = F extends LiteralTypeDef ? FlattenedOfLiteralChildren
  : F extends NullableTypeDef ? FlattenedOfNullableChildren<F, Prefix, VariableSegmentOverride, Depth>
  : F extends ListTypeDef ? FlattenedOfListChildren<F, Prefix, VariableSegmentOverride, Depth>
  : F extends StructuredTypeDef ? FlattenedOfStructChildren<F, Prefix, VariableSegmentOverride, Depth>
  : F extends DiscriminatingUnionTypeDef
    ? FlattenedOfDiscriminatingUnionChildren<F, Prefix, VariableSegmentOverride, Depth>
  : never;

type FlattenedOfLiteralChildren = {};

type FlattenedOfNullableChildren<
  F extends NullableTypeDef,
  Prefix extends string,
  VariableSegmentOverride extends string | undefined,
  Depth extends number,
> = InternalFlattenedOfChildren<F['nonNullableTypeDef'], Prefix, VariableSegmentOverride, Depth>;

type FlattenedOfListChildren<
  F extends ListTypeDef,
  Prefix extends string,
  VariableSegmentOverride extends string | undefined,
  Depth extends number,
> = InternalFlattenedOf<
  F['elements'],
  PrefixOf<
    Prefix,
    VariableSegmentOverride extends undefined ? number : VariableSegmentOverride
  >,
  VariableSegmentOverride,
  Depth
>;

type FlattenedOfStructFieldGroup<
  Fields extends Record<string, StructuredTypeField>,
  Prefix extends string,
  VariableSegmentOverride extends string | undefined,
  Depth extends number,
> =
  // if it's empty, then iterating the fields returns never, not an empty set, so
  // we need special handling for this
  {} extends Fields ? {}
    : UnionToIntersection<{
      readonly [K in keyof Fields]: InternalFlattenedOf<
        Fields[K]['valueType'],
        PrefixOf<Prefix, K>,
        VariableSegmentOverride,
        Depth
      >;
    }[keyof Fields]>;

type FlattenedOfStructFields<
  F extends StructuredTypeDefFields,
  Prefix extends string,
  VariableSegmentOverride extends string | undefined,
  Depth extends number,
> = FlattenedOfStructFieldGroup<F, Prefix, VariableSegmentOverride, Depth>;

type FlattenedOfStructChildren<
  F extends StructuredTypeDef,
  Prefix extends string,
  VariableSegmentOverride extends string | undefined,
  Depth extends number,
> = FlattenedOfStructFields<
  F['fields'],
  Prefix,
  VariableSegmentOverride,
  Depth
>;

type FlattenedOfDiscriminatingUnionChildren<
  F extends DiscriminatingUnionTypeDef,
  Prefix extends string,
  VariableSegmentOverride extends string | undefined,
  Depth extends number,
> =
  & UnionToIntersection<
    {
      readonly [K in keyof F['unions']]:
        & FlattenedOfStructFields<
          F['unions'][K],
          PrefixOf<Prefix, K>,
          VariableSegmentOverride,
          Depth
        >
        // synthesize a type for PrefixOf<Prefix, K>
        & ReadonlyRecord<PrefixOf<Prefix, K>, StructuredTypeDef<F['unions'][K]>>;
    }[keyof F['unions']]
  >
  // include the discriminator
  & {
    readonly [K in PrefixOf<Prefix, F['discriminator']>]: LiteralTypeDef<keyof F['unions']>;
  };

export function flattenTypesOf<T extends TypeDef, Prefix extends string>(
  t: T,
  prefix: Prefix,
): FlattenedOf<T, Prefix, 'n'> {
  return flattenTypesOfWithOverride<T, Prefix, 'n'>(t, prefix, 'n');
}

export function flattenTypesOfWithOverride<T extends TypeDef, Prefix extends string, Override extends string>(
  t: T,
  prefix: Prefix,
  override: Override,
): FlattenedOf<T, Prefix, Override> {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return flattenMapOfType<T, TypeDef, Prefix, Override>(
    t,
    function (def) {
      return def;
    },
    prefix,
    override,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any;
}
