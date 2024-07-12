import { type UnionToIntersection } from 'base/lang';
import { reduce } from 'base/record';
import {
  type DiscriminatingUnionTypeDef,
  type ListTypeDef,
  type LiteralTypeDef,
  type NullableTypeDef,
  type StructuredTypeDef,
  type StructuredTypeDefFields,
  type StructuredTypeField,
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

export type FlattenedMapOf<
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
  : F extends StructuredTypeDef ? FlattenedOfStructChildren<
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

type FlattenedOfStructFieldGroup<
  Fields extends Record<string, StructuredTypeField>,
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

type FlattenedOfStructChildren<
  F extends StructuredTypeDef,
  R,
  Prefix extends string,
  SegmentOverride extends string | undefined,
  Depth extends number,
> = FlattenedOfStructFieldGroup<
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
        FlattenedOfStructFieldGroup<
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
type InternalValueMapper = (
  def: TypeDef,
  valuePath: string,
  typePath: string,
  value: ValueTypeOf<TypeDef>,
  setValue?: ((value: ValueTypeOf<TypeDef>) => void) | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => any;

export function flattenMapOfMutableValue<
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
): FlattenedMapOf<T, R, Prefix> {
  const acc: InternalFlattenedValues = {};
  flattenValueInternal(
    acc,
    def,
    v,
    undefined,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    f as InternalValueMapper,
    prefix,
    prefix,
  );
  // cast to type-safe value
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
  return acc as any;
}

// flatten value

export function flattenMapOfValue<
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
): FlattenedMapOf<T, R, Prefix> {
  const acc: InternalFlattenedValues = {};
  flattenValueInternal(
    acc,
    def,
    v,
    undefined,
    function (
      def: TypeDef,
      valuePath: string,
      typePath: string,
      value: ValueTypeOf<TypeDef>,
    ) {
      return f(
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        def as T,
        valuePath,
        typePath,
        value,
      );
    },
    prefix,
    prefix,
  );
  // cast to type-safe value
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
  return acc as any;
}

function flattenValueInternal(
  acc: InternalFlattenedValues,
  def: TypeDef,
  value: ValueTypeOf<TypeDef>,
  setValue: ((value: ValueTypeOf<TypeDef>) => void) | undefined,
  f: InternalValueMapper,
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
  f: InternalValueMapper,
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
    case TypeDefType.Structured:
      return flattenStructValue(acc, def, value, f, valuePath, typePath);
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
  f: InternalValueMapper,
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
  f: InternalValueMapper,
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
      return flattenValueInternal(
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
  fields: StructuredTypeDefFields,
  // no way to know anything about the type here
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  f: InternalValueMapper,
  valuePath: string,
  typePath: string,
) {
  return reduce(
    fields,
    function (acc, key, field): InternalFlattenedValues {
      const setValue = function (i: ValueTypeOf<TypeDef>) {
        value[key] = i;
      };
      return flattenValueInternal(
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

function flattenStructValue(
  acc: InternalFlattenedValues,
  def: StructuredTypeDef,
  value: ValueTypeOf<StructuredTypeDef>,
  f: InternalValueMapper,
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
  f: InternalValueMapper,
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

// flatten type

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InternalFlattenedTypes = Record<string, any>;

export function flattenMapOfType<
  T extends TypeDef,
  R,
  Prefix extends string,
  SegmentOverride extends string = 'n',
>(
  def: T,
  f: (
    def: T,
    path: string,
  ) => R,
  prefix: Prefix,
  segmentOverride: SegmentOverride,
): FlattenedMapOf<T, R, Prefix, SegmentOverride> {
  const acc = flattenTypeInternal(
    {},
    def,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    f as InternalTypeMapper,
    prefix,
    segmentOverride,
  );
  // cast to type-safe value
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
  return acc as any;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InternalTypeMapper = (def: TypeDef, path: string) => any;

function flattenTypeInternal(
  acc: InternalFlattenedTypes,
  def: TypeDef,
  f: InternalTypeMapper,
  path: string,
  segmentOverride: string,
): InternalFlattenedTypes {
  acc[path] = f(def, path);
  return flattenChildTypes(
    acc,
    def,
    f,
    path,
    segmentOverride,
  );
}

function flattenChildTypes(
  acc: InternalFlattenedTypes,
  def: TypeDef,
  f: InternalTypeMapper,
  path: string,
  segmentOverride: string,
): InternalFlattenedTypes {
  switch (def.type) {
    case TypeDefType.Literal:
      return flattenLiteralType(acc);
    case TypeDefType.Nullable:
      return flattenNullableType(acc, def, f, path, segmentOverride);
    case TypeDefType.List:
      return flattenListType(acc, def, f, path, segmentOverride);
    case TypeDefType.Structured:
      return flattenStructType(acc, def, f, path, segmentOverride);
    case TypeDefType.DiscriminatingUnion:
      return flattenDiscriminatingUnionType(acc, def, f, path, segmentOverride);
    default:
      throw new UnreachableError(def);
  }
}

function flattenLiteralType(acc: InternalFlattenedValues): InternalFlattenedTypes {
  return acc;
}

function flattenNullableType(
  acc: InternalFlattenedTypes,
  {
    nonNullableTypeDef,
  }: NullableTypeDef,
  f: InternalTypeMapper,
  path: string,
  segmentOverride: string,
): InternalFlattenedTypes {
  return flattenChildTypes(acc, nonNullableTypeDef, f, path, segmentOverride);
}

function flattenListType(
  acc: InternalFlattenedTypes,
  {
    elements,
  }: ListTypeDef,
  f: InternalTypeMapper,
  path: string,
  segmentOverride: string,
): InternalFlattenedTypes {
  return flattenTypeInternal(acc, elements, f, prefixOf(path, segmentOverride), segmentOverride);
}

function flattenStructType(
  acc: InternalFlattenedTypes,
  {
    fields,
  }: StructuredTypeDef,
  f: InternalTypeMapper,
  path: string,
  segmentOverride: string,
): InternalFlattenedTypes {
  return flattenStructTypeFields(acc, fields, f, path, segmentOverride);
}

function flattenDiscriminatingUnionType(
  acc: InternalFlattenedTypes,
  {
    unions,
    discriminator,
  }: DiscriminatingUnionTypeDef,
  f: InternalTypeMapper,
  path: string,
  segmentOverride: string,
): InternalFlattenedTypes {
  return reduce(
    unions,
    function (acc, k, fields) {
      const key = prefixOf(path, k);
      flattenStructTypeFields(acc, fields, f, key, segmentOverride);
      acc[key] = {
        type: TypeDefType.Structured,
        fields,
      };
      return acc;
    },
    {
      ...acc,
      [prefixOf(path, discriminator)]: {
        type: TypeDefType.Literal,
        value: undefined,
      },
    },
  );
}

function flattenStructTypeFields(
  acc: InternalFlattenedTypes,
  t: StructuredTypeDefFields,
  f: InternalTypeMapper,
  path: string,
  segmentOverride: string,
): InternalFlattenedTypes {
  return reduce(
    t,
    function (acc, k, field) {
      flattenTypeInternal(
        acc,
        field.valueType,
        f,
        prefixOf(path, k),
        segmentOverride,
      );
      return acc;
    },
    acc,
  );
}
