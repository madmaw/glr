import {
  type ReadonlyRecord,
  reduce,
} from 'base/record';
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
} from 'base/type/definition';
import {
  type ReadonlyOf,
  type ReadonlyOfDiscriminatingUnion,
  type ReadonlyOfList,
  type ReadonlyOfRecord,
} from 'base/type/readonly_of';
import {
  type ValueTypeOf,
  type ValueTypeOfDiscriminatingUnion,
  type ValueTypeOfList,
  type ValueTypeOfRecord,
  type ValueTypeOfRecordFields,
} from 'base/type/value_type_of';
import { UnreachableError } from 'base/unreachable_error';

// creates an immutable copy of the supplied value
function instantiate<T extends ReadonlyOf<TypeDef>>(
  def: T,
  value: ValueTypeOf<T>,
): ValueTypeOf<T> {
  switch (def.type) {
    case TypeDefType.Literal:
      return instantiateLiteral(def, value);
    case TypeDefType.List:
      // defaults to any type because we cannot supply the element type here
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return instantiateList(def, value) as ValueTypeOf<T>;
    case TypeDefType.Record:
      // defaults to any type because we cannot supply the element type here
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return instantiateRecord(def, value) as ValueTypeOf<T>;
    case TypeDefType.DiscriminatingUnion:
      // defaults to any type because we cannot supply the element type here
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return instantiateDiscriminatingUnion(def, value) as ValueTypeOf<T>;
    default:
      throw new UnreachableError(def);
  }
}

function instantiateLiteral<V>(_def: ReadonlyOf<LiteralTypeDef<V>>, v: V): ValueTypeOf<LiteralTypeDef<V>> {
  return v;
}

function instantiateList<T extends ReadonlyOfList<ListTypeDef<E>>, E extends TypeDef>(
  {
    elements,
  }: T,
  arr: ValueTypeOf<T>,
): ValueTypeOfList<T, {}> {
  // for some reason, even though `readonly` is always true here, the type inference doesn't
  // pick up that only a `readonly` array, like the one returned by freeze, can be returned
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return Object.freeze(arr.map(function (value) {
    return instantiate(elements, value);
  })) as ValueTypeOfList<T, {}>;
}

function instantiateRecordFields<
  Fields extends Record<RecordKey, RecordTypeDefField>,
  Extra,
>(
  fields: Fields,
  value: ValueTypeOfRecordFields<Fields, {}>,
  extra: Extra,
): ValueTypeOfRecordFields<Fields, Extra> {
  const record = reduce(fields, function (acc, key, field) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
    const fieldValue = (value as any)[key];
    if (!field.optional || fieldValue !== undefined) {
      acc[key] = instantiate(field.valueType, fieldValue);
    }
    return acc;
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
  }, extra as Record<string, any>);
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return Object.freeze(record) as ValueTypeOfRecordFields<Fields, Extra>;
}

function instantiateRecord<
  T extends ReadonlyOfRecord<RecordTypeDef<Fields>>,
  Fields extends ReadonlyRecord<RecordKey, RecordTypeDefField>,
>(
  {
    fields,
  }: T,
  value: ValueTypeOfRecord<T, {}>,
): ValueTypeOfRecord<T, {}> {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return instantiateRecordFields(fields, value, {}) as ValueTypeOfRecord<T, {}>;
}

function instantiateDiscriminatingUnion<
  T extends ReadonlyOfDiscriminatingUnion<DiscriminatingUnionTypeDef<D, U>>,
  D extends string,
  U extends ReadonlyRecord<RecordKey, RecordTypeDefFields>,
>(
  {
    discriminator,
    unions,
  }: T,
  value: ValueTypeOfDiscriminatingUnion<T, {}>,
): ValueTypeOfDiscriminatingUnion<T, {}> {
  const discriminatorValue = value[discriminator];
  // record type only contains the current type of the discriminated union
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return instantiateRecordFields(
    unions[discriminatorValue],
    // incompatible types here
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
    value as any,
    // because discriminator can technically have multiple valid keys
    // e.g. `DiscriminatorUnionTypeDef<'x' | 'y', {}>`
    // this type can never match
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    {
      [discriminator]: discriminatorValue,
    } as unknown as {
      [K in D]: keyof U;
    },
  ) as unknown as ValueTypeOfDiscriminatingUnion<T, {}>;
}

export const instantiateFrozen = instantiate;
