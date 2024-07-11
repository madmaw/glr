import { type UnionToIntersection } from 'base/lang';
import { reduce } from 'base/record';
import {
  type DiscriminatingUnionTypeDef,
  type ListTypeDef,
  type LiteralTypeDef,
  type NullableTypeDef,
  type RecordTypeDef,
  type RecordTypeDefField,
  type RecordTypeDefFields,
  type TypeDef,
  TypeDefType,
} from 'base/type/definition';
import { type ValueTypeOf } from 'base/type/value_type_of';
import { UnreachableError } from 'base/unreachable_error';
import {
  type PrefixOf,
  prefixOf,
} from './prefix_of';
import { type ReadonlyOf } from './readonly_of';

// infinitely recurses
// export type FlattenedRecordOf2<
//   T extends TypeDef,
//   R,
//   Prefix extends string = '',
//   SegmentOverride extends string | undefined = undefined,
//   F extends Record<string, TypeDef> = FlattenedOf<T, Prefix, SegmentOverride>,
// > = {
//   [K in keyof F]: R;
// };

type DefaultDepth = 21;

type MaybePartial<
  OptionalWithUndefinedSegmentOverride extends boolean,
  SegmentOverride extends string | undefined,
  P,
> = SegmentOverride extends undefined ? OptionalWithUndefinedSegmentOverride extends true ? Partial<P>
  : P
  : P;

export type FlattenedRecordOf<
  F extends TypeDef,
  R,
  Prefix extends string = '',
  SegmentOverride extends string | undefined = undefined,
> = InternalFlattenedOf<F, R, Prefix, SegmentOverride, DefaultDepth>;

type InternalFlattenedOf<
  F extends TypeDef,
  R,
  Prefix extends string,
  SegmentOverride extends string | undefined,
  Depth extends number,
  NextDepth extends number = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20][Depth],
> = NextDepth extends -1 ? {}
  :
    & InternalFlattenedOfChildren<F, R, Prefix, SegmentOverride, NextDepth>
    & Record<Prefix, R>;

type InternalFlattenedOfChildren<
  F extends TypeDef,
  R,
  Prefix extends string,
  SegmentOverride extends string | undefined,
  Depth extends number,
> = F extends LiteralTypeDef ? FlattenedOfLiteralChildren
  : F extends NullableTypeDef ? FlattenedOfNullableChildren<
      F,
      R,
      Prefix,
      SegmentOverride,
      Depth
    >
  : F extends ListTypeDef ? FlattenedOfListChildren<
      F,
      R,
      Prefix,
      SegmentOverride,
      Depth
    >
  : F extends RecordTypeDef ? FlattenedOfRecordChildren<
      F,
      R,
      Prefix,
      SegmentOverride,
      Depth
    >
  : F extends DiscriminatingUnionTypeDef ? FlattenedOfDiscriminatingUnionChildren<
      F,
      R,
      Prefix,
      SegmentOverride,
      Depth
    >
  : never;

type FlattenedOfLiteralChildren = {};

type FlattenedOfNullableChildren<
  F extends NullableTypeDef,
  R,
  Prefix extends string,
  SegmentOverride extends string | undefined,
  Depth extends number,
> = MaybePartial<
  true,
  SegmentOverride,
  InternalFlattenedOfChildren<
    F['nonNullableTypeDef'],
    R,
    Prefix,
    SegmentOverride,
    Depth
  >
>;

type FlattenedOfListChildren<
  F extends ListTypeDef,
  R,
  Prefix extends string,
  SegmentOverride extends string | undefined,
  Depth extends number,
> = InternalFlattenedOf<
  F['elements'],
  R,
  PrefixOf<
    Prefix,
    SegmentOverride extends undefined ? number : SegmentOverride
  >,
  SegmentOverride,
  Depth
>;

type FlattenedOfRecordFieldGroup<
  Fields extends Record<string, RecordTypeDefField>,
  R,
  Prefix extends string,
  SegmentOverride extends string | undefined,
  Depth extends number,
> =
  // if it's empty, then iterating the fields returns never, not an empty set, so
  // we need special handling for this
  {} extends Fields ? {}
    : UnionToIntersection<{
      readonly [K in keyof Fields]: MaybePartial<
        Fields[K]['optional'],
        SegmentOverride,
        InternalFlattenedOf<
          Fields[K]['valueType'],
          R,
          PrefixOf<Prefix, K>,
          SegmentOverride,
          Depth
        >
      >;
    }[keyof Fields]>;

type FlattenedOfRecordChildren<
  F extends RecordTypeDef,
  R,
  Prefix extends string,
  SegmentOverride extends string | undefined,
  Depth extends number,
> = FlattenedOfRecordFieldGroup<
  F['fields'],
  R,
  Prefix,
  SegmentOverride,
  Depth
>;

type FlattenedOfDiscriminatingUnionChildren<
  F extends DiscriminatingUnionTypeDef,
  R,
  Prefix extends string,
  SegmentOverride extends string | undefined,
  Depth extends number,
> =
  & UnionToIntersection<
    {
      readonly [K in keyof F['unions']]: MaybePartial<
        true,
        SegmentOverride,
        FlattenedOfRecordFieldGroup<
          F['unions'][K],
          R,
          PrefixOf<Prefix, K>,
          SegmentOverride,
          Depth
        >
      >;
      // do not synthesize a type for PrefixOf<Prefix, K>
      // & ReadonlyRecord<
      //   PrefixOf<ValuePrefix, K>,
      //   FlattenedValue<RecordTypeDef<F['unions'][K]>, PrefixOf<TypePrefix, K>>
      // >;
    }[keyof F['unions']]
  >
  // include the discriminator
  & (
    {
      [K in PrefixOf<Prefix, F['discriminator']>]: R;
    }
  );

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InternalFlattenedValues = Record<string, any>;
type InternalMapper = (
  def: TypeDef,
  valuePath: string,
  typePath: string,
  value: ValueTypeOf<TypeDef>,
  setValue?: ((value: ValueTypeOf<TypeDef>) => void) | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => any;

export function flattenMutableRecordOfValue<
  T extends TypeDef,
  R,
  Prefix extends string,
>(
  def: T,
  v: ValueTypeOf<T>,
  f: (
    def: T,
    valuePath: string,
    typePath: string,
    value: ValueTypeOf<T>,
    setValue: (value: ValueTypeOf<T>) => void,
  ) => R,
  prefix: Prefix,
): FlattenedRecordOf<T, R, Prefix> {
  const acc: InternalFlattenedValues = {};
  flattenInternal(
    acc,
    def,
    v,
    undefined,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    f as InternalMapper,
    prefix,
    prefix,
  );
  // cast to type-safe value
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
  return acc as any;
}

export function flattenRecordOfValue<
  T extends TypeDef,
  R,
  Prefix extends string,
>(
  def: T,
  v: ValueTypeOf<ReadonlyOf<T>>,
  f: (
    def: T,
    valuePath: string,
    typePath: string,
    value: ValueTypeOf<T>,
  ) => R,
  prefix: Prefix,
): FlattenedRecordOf<T, R, Prefix> {
  const acc: InternalFlattenedValues = {};
  flattenInternal(
    acc,
    def,
    v,
    undefined,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    f as InternalMapper,
    prefix,
    prefix,
  );
  // cast to type-safe value
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
  return acc as any;
}

function flattenInternal(
  acc: InternalFlattenedValues,
  def: TypeDef,
  value: ValueTypeOf<TypeDef>,
  setValue: ((value: ValueTypeOf<TypeDef>) => void) | undefined,
  f: InternalMapper,
  valuePath: string,
  typePath: string,
): InternalFlattenedValues {
  acc[valuePath] = f(def, valuePath, typePath, value, setValue);
  return flattenChildValues(acc, def, value, f, valuePath, typePath);
}

function flattenChildValues(
  acc: InternalFlattenedValues,
  def: TypeDef,
  value: ValueTypeOf<TypeDef>,
  f: InternalMapper,
  valuePath: string,
  typePath: string,
): InternalFlattenedValues {
  switch (def.type) {
    case TypeDefType.Literal:
      return flattenLiteralValue(acc);
    case TypeDefType.Nullable:
      return flattenNullableValue(acc, def, value, f, valuePath, typePath);
    case TypeDefType.List:
      return flattenListValue(acc, def, value, f, valuePath, typePath);
    case TypeDefType.Record:
      return flattenRecordValue(acc, def, value, f, valuePath, typePath);
    case TypeDefType.DiscriminatingUnion:
      return flattenDiscriminatingUnionValue(acc, def, value, f, valuePath, typePath);
    default:
      throw new UnreachableError(def);
  }
}

function flattenLiteralValue(acc: InternalFlattenedValues) {
  return acc;
}

function flattenNullableValue(
  acc: InternalFlattenedValues,
  {
    nonNullableTypeDef: valueType,
  }: NullableTypeDef,
  value: ValueTypeOf<NullableTypeDef>,
  f: InternalMapper,
  valuePath: string,
  typePath: string,
): InternalFlattenedValues {
  if (value != null) {
    return flattenChildValues(
      acc,
      valueType,
      value,
      f,
      valuePath,
      typePath,
    );
  }
  return acc;
}

function flattenListValue(
  acc: InternalFlattenedValues,
  def: ListTypeDef,
  value: ValueTypeOf<ListTypeDef>,
  f: InternalMapper,
  valuePath: string,
  typePath: string,
): InternalFlattenedValues {
  const {
    elements,
  } = def;
  const elementTypePath = prefixOf(typePath, 'n');
  return value.reduce(
    function (
      acc: InternalFlattenedValues,
      e: ValueTypeOf<TypeDef>,
      i: number,
    ) {
      const elementValuePath = prefixOf(valuePath, i);
      const setValue = function (item: ValueTypeOf<TypeDef>) {
        value[i] = item;
      };
      return flattenInternal(
        acc,
        elements,
        e,
        setValue,
        f,
        elementValuePath,
        elementTypePath,
      );
    },
    acc,
  );
}

function flattenFieldValues(
  acc: InternalFlattenedValues,
  fields: RecordTypeDefFields,
  // no way to know anything about the type here
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  f: InternalMapper,
  valuePath: string,
  typePath: string,
) {
  return reduce(
    fields,
    function (acc, key, field): InternalFlattenedValues {
      const setValue = function (i: ValueTypeOf<TypeDef>) {
        value[key] = i;
      };
      return flattenInternal(
        acc,
        field.valueType,
        value[key],
        setValue,
        f,
        prefixOf(valuePath, key),
        prefixOf(typePath, key),
      );
    },
    acc,
  );
}

function flattenRecordValue(
  acc: InternalFlattenedValues,
  def: RecordTypeDef,
  value: ValueTypeOf<RecordTypeDef>,
  f: InternalMapper,
  valuePath: string,
  typePath: string,
) {
  const {
    fields,
  } = def;
  return flattenFieldValues(
    acc,
    fields,
    value,
    f,
    valuePath,
    typePath,
  );
}

function flattenDiscriminatingUnionValue(
  acc: InternalFlattenedValues,
  def: DiscriminatingUnionTypeDef,
  value: ValueTypeOf<DiscriminatingUnionTypeDef>,
  f: InternalMapper,
  valuePath: string,
  typePath: string,
) {
  const {
    discriminator,
    unions,
  } = def;
  const disc = value[discriminator];
  const fields = unions[disc];
  const discriminatorValuePath = prefixOf(valuePath, discriminator);
  const discriminatorTypePath = prefixOf(typePath, discriminator);
  // TODO maybe this shouldn't be done?
  acc[discriminatorValuePath] = f(
    {
      type: TypeDefType.Literal,
      value: undefined,
    },
    discriminatorValuePath,
    discriminatorTypePath,
    disc,
    undefined,
  );
  return flattenFieldValues(
    acc,
    fields,
    value,
    f,
    prefixOf(valuePath, disc),
    prefixOf(typePath, disc),
  );
}
