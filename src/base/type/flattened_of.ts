import { type UnionToIntersection } from 'base/lang';
import {
  type ReadonlyRecord,
  reduce,
} from 'base/record';
import { UnreachableError } from 'base/unreachable_error';
import {
  type DiscriminatingUnionTypeDef,
  type ListTypeDef,
  type LiteralTypeDef,
  type NullableTypeDef,
  type RecordKey,
  type RecordTypeDef,
  type RecordTypeDefField,
  type RecordTypeDefFields,
  type TypeDef,
  TypeDefType,
} from './definition';

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
  : F extends RecordTypeDef ? FlattenedOfRecordChildren<F, Prefix, VariableSegmentOverride, Depth>
  : F extends DiscriminatingUnionTypeDef
    ? FlattenedOfDiscriminatingUnionChildren<F, Prefix, VariableSegmentOverride, Depth>
  : never;

type PrefixOf<
  Prefix extends string,
  Key extends RecordKey | symbol,
> = Key extends RecordKey ? Prefix extends '' ? `${Key}`
  : `${Prefix}.${Key}`
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

type FlattenedOfRecordFieldGroup<
  Fields extends Record<string, RecordTypeDefField>,
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

type FlattenedOfRecordFields<
  F extends RecordTypeDefFields,
  Prefix extends string,
  VariableSegmentOverride extends string | undefined,
  Depth extends number,
> = FlattenedOfRecordFieldGroup<F, Prefix, VariableSegmentOverride, Depth>;

type FlattenedOfRecordChildren<
  F extends RecordTypeDef,
  Prefix extends string,
  VariableSegmentOverride extends string | undefined,
  Depth extends number,
> = FlattenedOfRecordFields<
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
        & FlattenedOfRecordFields<
          F['unions'][K],
          PrefixOf<Prefix, K>,
          VariableSegmentOverride,
          Depth
        >
        // synthesize a type for PrefixOf<Prefix, K>
        & ReadonlyRecord<PrefixOf<Prefix, K>, RecordTypeDef<F['unions'][K]>>;
    }[keyof F['unions']]
  >
  // include the discriminator
  & {
    readonly [K in PrefixOf<Prefix, F['discriminator']>]: LiteralTypeDef<keyof F['unions']>;
  };

export function prefixOf(prefix: string, postfix: string | number) {
  return prefix === '' ? `${postfix}` : `${prefix}.${postfix}`;
}

export function flattenedOf<T extends TypeDef, Prefix extends string>(
  t: T,
  prefix: Prefix,
): FlattenedOf<T, Prefix, 'n'> {
  return flattenedOfWithOverride<T, Prefix, 'n'>(t, prefix, 'n');
}

export function flattenedOfWithOverride<T extends TypeDef, Prefix extends string, Override extends string>(
  t: T,
  prefix: Prefix,
  override: Override,
): FlattenedOf<T, Prefix, Override> {
  const acc: Record<string, TypeDef> = {};
  flattenedOfInternal(acc, t, prefix, override);
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
  return acc as any;
}

function flattenedOfInternal(
  acc: Record<string, TypeDef>,
  t: TypeDef,
  prefix: string,
  override: string,
): void {
  acc[prefix] = t;
  flattenedOfInternalChildren(acc, t, prefix, override);
}

function flattenedOfInternalChildren(
  acc: Record<string, TypeDef>,
  t: TypeDef,
  prefix: string,
  override: string,
): void {
  switch (t.type) {
    case TypeDefType.Literal:
      return flattenedOfLiteral();
    case TypeDefType.Nullable:
      return flattenedOfNullable(acc, t, prefix, override);
    case TypeDefType.List:
      return flattenedOfList(acc, t, prefix, override);
    case TypeDefType.Record:
      return flattenedOfRecord(acc, t, prefix, override);
    case TypeDefType.DiscriminatingUnion:
      return flattenedOfDiscriminatingUnion(acc, t, prefix, override);
    default:
      throw new UnreachableError(t);
  }
}

function flattenedOfLiteral(): void {
}

function flattenedOfNullable(
  acc: Record<string, TypeDef>,
  { nonNullableTypeDef: valueType }: NullableTypeDef,
  prefix: string,
  override: string,
): void {
  flattenedOfInternalChildren(acc, valueType, prefix, override);
}

function flattenedOfList(
  acc: Record<string, TypeDef>,
  t: ListTypeDef,
  prefix: string,
  override: string,
): void {
  flattenedOfInternal(acc, t.elements, prefixOf(prefix, override), override);
}

function flattenedOfRecord(
  acc: Record<string, TypeDef>,
  t: RecordTypeDef,
  prefix: string,
  override: string,
): void {
  return flattenedOfRecordFields(acc, t.fields, prefix, override);
}

function flattenedOfDiscriminatingUnion(
  acc: Record<string, TypeDef>,
  t: DiscriminatingUnionTypeDef,
  prefix: string,
  override: string,
): void {
  acc[prefixOf(prefix, t.discriminator)] = {
    type: TypeDefType.Literal,
    value: undefined,
  };
  reduce<string, RecordTypeDefFields, Record<string, TypeDef>>(
    t.unions,
    function (acc, k, fields) {
      const key = prefixOf(prefix, k);
      flattenedOfRecordFields(acc, fields, key, override);
      acc[key] = {
        type: TypeDefType.Record,
        fields,
      };
      return acc;
    },
    acc,
  );
}

function flattenedOfRecordFields(
  acc: Record<string, TypeDef>,
  t: RecordTypeDefFields,
  prefix: string,
  override: string,
): void {
  reduce(
    t,
    function (acc, k, field) {
      flattenedOfInternal(
        acc,
        field.valueType,
        prefixOf(prefix, k),
        override,
      );
      return acc;
    },
    acc,
  );
}
