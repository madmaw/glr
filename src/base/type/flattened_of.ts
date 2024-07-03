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
  type RecordKey,
  type RecordTypeDef,
  type RecordTypeDefField,
  type RecordTypeDefFields,
  type TypeDef,
  TypeDefType,
} from './definition';

export type FlattenedOf<
  F extends TypeDef,
  Prefix extends string = '',
  VariableSegmentOverride extends string | undefined = undefined,
> = F extends LiteralTypeDef ? FlattenedOfLiteral<F, Prefix>
  : F extends ListTypeDef ? FlattenedOfList<F, Prefix, VariableSegmentOverride>
  : F extends RecordTypeDef ? FlattenedOfRecord<F, Prefix, VariableSegmentOverride>
  : F extends DiscriminatingUnionTypeDef ? FlattenedOfDiscriminatingUnion<F, Prefix, VariableSegmentOverride>
  : never;

type PrefixOf<
  Prefix extends string,
  Key extends RecordKey | symbol,
> = Key extends RecordKey ? Prefix extends '' ? `${Key}`
  : `${Prefix}.${Key}`
  : never;

type FlattenedOfLiteral<
  F extends LiteralTypeDef,
  Prefix extends string,
> = ReadonlyRecord<Prefix, F>;

type FlattenedOfList<
  F extends ListTypeDef,
  Prefix extends string,
  VariableSegmentOverride extends string | undefined,
> =
  & FlattenedOf<
    F['elements'],
    PrefixOf<
      Prefix,
      VariableSegmentOverride extends undefined ? number : VariableSegmentOverride
    >
  >
  & ReadonlyRecord<Prefix, F>;

type FlattenedOfRecordFieldGroup<
  Fields extends Record<string, RecordTypeDefField>,
  Prefix extends string,
  VariableSegmentOverride extends string | undefined,
> =
  // if it's empty, then iterating the fields returns never, not an empty set, so
  // we need special handling for this
  {} extends Fields ? {}
    : UnionToIntersection<{
      readonly [K in keyof Fields]: FlattenedOf<
        Fields[K]['valueType'],
        PrefixOf<Prefix, K>,
        VariableSegmentOverride
      >;
    }[keyof Fields]>;

type FlattenedOfRecordFields<
  F extends RecordTypeDefFields,
  Prefix extends string,
  VariableSegmentOverride extends string | undefined,
> = FlattenedOfRecordFieldGroup<F, Prefix, VariableSegmentOverride>;

type FlattenedOfRecord<
  F extends RecordTypeDef,
  Prefix extends string,
  VariableSegmentOverride extends string | undefined,
> = FlattenedOfRecordFields<
  F['fields'],
  Prefix,
  VariableSegmentOverride
> & ReadonlyRecord<Prefix, F>;

type FlattenedOfDiscriminatingUnion<
  F extends DiscriminatingUnionTypeDef,
  Prefix extends string,
  VariableSegmentOverride extends string | undefined,
> =
  & UnionToIntersection<
    {
      readonly [K in keyof F['unions']]:
        & FlattenedOfRecordFields<
          F['unions'][K],
          PrefixOf<Prefix, K>,
          VariableSegmentOverride
        >
        // synthesize a type for PrefixOf<Prefix, K>
        & ReadonlyRecord<PrefixOf<Prefix, K>, RecordTypeDef<F['unions'][K]>>;
    }[keyof F['unions']]
  >
  // include the discriminator
  & {
    readonly [K in PrefixOf<Prefix, F['discriminator']>]: LiteralTypeDef<keyof F['unions']>;
  }
  // include self
  & ReadonlyRecord<Prefix, F>;

function prefixOf(prefix: string, postfix: string | number) {
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
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return flattenedOfInternal(t, prefix, override) as FlattenedOf<T, Prefix, Override>;
}

function flattenedOfInternal(t: TypeDef, prefix: string, override: string): Record<string, TypeDef> {
  switch (t.type) {
    case TypeDefType.Literal:
      return flattenedOfLiteral(t, prefix);
    case TypeDefType.List:
      return flattenedOfList(t, prefix, override);
    case TypeDefType.Record:
      return flattenedOfRecord(t, prefix, override);
    case TypeDefType.DiscriminatingUnion:
      return flattenedOfDiscriminatingUnion(t, prefix, override);
    default:
      throw new UnreachableError(t);
  }
}

function flattenedOfLiteral(
  t: LiteralTypeDef,
  prefix: string,
): Record<string, TypeDef> {
  return {
    [prefix]: t,
  };
}

function flattenedOfList(
  t: ListTypeDef,
  prefix: string,
  override: string,
): Record<string, TypeDef> {
  return {
    ...flattenedOfInternal(t.elements, prefixOf(prefix, override), override),
    [prefix]: t,
  };
}

function flattenedOfRecord(
  t: RecordTypeDef,
  prefix: string,
  override: string,
): Record<string, TypeDef> {
  return {
    ...flattenedOfRecordFields(t.fields, prefix, override),
    [prefix]: t,
  };
}

function flattenedOfDiscriminatingUnion(
  t: DiscriminatingUnionTypeDef,
  prefix: string,
  override: string,
): Record<string, TypeDef> {
  return reduce<string, RecordTypeDefFields, Record<string, TypeDef>>(
    t.unions,
    function (acc, k, fields) {
      const key = prefixOf(prefix, k);
      return {
        ...flattenedOfRecordFields(fields, key, override),
        [key]: {
          type: TypeDefType.Record,
          fields,
        },
        ...acc,
      };
    },
    {
      [prefixOf(prefix, t.discriminator)]: {
        type: TypeDefType.Literal,
        value: undefined,
      },
      [prefix]: t,
    },
  );
}

function flattenedOfRecordFields(
  t: RecordTypeDefFields,
  prefix: string,
  override: string,
): Record<string, TypeDef> {
  return reduce(
    t,
    function (acc, k, field) {
      const flattenedField = flattenedOfInternal(
        field.valueType,
        prefixOf(prefix, k),
        override,
      );
      return {
        ...acc,
        ...flattenedField,
      };
    },
    {},
  );
}
