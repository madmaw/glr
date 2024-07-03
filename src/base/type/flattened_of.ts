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

export type FlattenedOf<F extends TypeDef, Prefix extends string = ''> = F extends LiteralTypeDef
  ? FlattenedOfLiteral<F, Prefix>
  : F extends ListTypeDef ? FlattenedOfList<F, Prefix>
  : F extends RecordTypeDef ? FlattenedOfRecord<F, Prefix>
  : F extends DiscriminatingUnionTypeDef ? FlattenedOfDiscriminatingUnion<F, Prefix>
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
  Index extends number = number,
> = F extends ListTypeDef<infer E> ?
    & FlattenedOf<E, PrefixOf<Prefix, Index>>
    & ReadonlyRecord<Prefix, F>
  : never;

type FlattenedOfRecordFieldGroup<
  Fields extends Record<string, RecordTypeDefField>,
  Prefix extends string,
> = {} extends Fields ? {}
  : UnionToIntersection<{
    readonly [K in keyof Fields]: FlattenedOf<
      Fields[K]['valueType'],
      PrefixOf<Prefix, K>
    >;
  }[keyof Fields]>;

type FlattenedOfRecordFields<
  F extends RecordTypeDefFields,
  Prefix extends string,
> = F extends RecordTypeDefFields ? FlattenedOfRecordFieldGroup<F, Prefix>
  : never;

type FlattenedOfRecord<
  F extends RecordTypeDef,
  Prefix extends string,
> = FlattenedOfRecordFields<F['fields'], Prefix> & ReadonlyRecord<Prefix, F>;

type FlattenedOfDiscriminatingUnion<
  F extends DiscriminatingUnionTypeDef,
  Prefix extends string,
> = F extends DiscriminatingUnionTypeDef<infer D, infer U>
  // combine all the possible unions (we don't/can't discriminate on the paths)
  ?
    & {
      readonly [K in keyof U]:
        & FlattenedOfRecordFields<
          U[K],
          PrefixOf<Prefix, K>
        >
        // synthesize a type for PrefixOf<Prefix, K>
        & ReadonlyRecord<PrefixOf<Prefix, K>, RecordTypeDef<U[K]>>;
    }[keyof U]
    // include the discriminator
    & {
      readonly [K in PrefixOf<Prefix, D>]: LiteralTypeDef<keyof U>;
    }
    // include self
    & ReadonlyRecord<Prefix, F>
  : never;

function prefixOf(prefix: string, postfix: string | number) {
  return prefix === '' ? `${postfix}` : `${prefix}.${postfix}`;
}

export function flattenedOf<T extends TypeDef, Prefix extends string = ''>(
  t: T,
  prefix: Prefix,
): FlattenedOf<T, Prefix> {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return flattenedOfInternal(t, prefix) as FlattenedOf<T, Prefix>;
}

function flattenedOfInternal(t: TypeDef, prefix: string): Record<string, TypeDef> {
  switch (t.type) {
    case TypeDefType.Literal:
      return flattenedOfLiteral(t, prefix);
    case TypeDefType.List:
      return flattenedOfList(t, prefix);
    case TypeDefType.Record:
      return flattenedOfRecord(t, prefix);
    case TypeDefType.DiscriminatingUnion:
      return flattenedOfDiscriminatingUnion(t, prefix);
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
): Record<string, TypeDef> {
  return {
    ...flattenedOfInternal(t.elements, prefixOf(prefix, '0')),
    [prefix]: t,
  };
}

function flattenedOfRecord(
  t: RecordTypeDef,
  prefix: string,
): Record<string, TypeDef> {
  return {
    ...flattenedOfRecordFields(t.fields, prefix),
    [prefix]: t,
  };
}

function flattenedOfDiscriminatingUnion(
  t: DiscriminatingUnionTypeDef,
  prefix: string,
): Record<string, TypeDef> {
  return reduce<string, RecordTypeDefFields, Record<string, TypeDef>>(
    t.unions,
    function (acc, k, fields) {
      const key = prefixOf(prefix, k);
      return {
        ...flattenedOfRecordFields(fields, key),
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
): Record<string, TypeDef> {
  return reduce(
    t,
    function (acc, k, field) {
      const flattenedField = flattenedOfInternal(field.valueType, prefixOf(prefix, k));
      return {
        ...acc,
        ...flattenedField,
      };
    },
    {},
  );
}
