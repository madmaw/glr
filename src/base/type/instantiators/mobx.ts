import { type MobxObservable } from 'base/mobx';
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
import { type ReadonlyOf } from 'base/type/readonly_of';
import {
  type ValueTypeOf,
  type ValueTypeOfDiscriminatingUnion,
  type ValueTypeOfList,
  type ValueTypeOfRecord,
  type ValueTypeOfRecordFields,
} from 'base/type/value_type_of';
import { UnreachableError } from 'base/unreachable_error';
import { observable } from 'mobx';

/**
 * Creates a mobx observable copy of the supplied value
 * @param def description of the object to create
 * @param value the value to populate the object from
 * @returns the observable copy of the supplied value
 */
function instantiate<T extends TypeDef>(
  def: T,
  value: ValueTypeOf<ReadonlyOf<T>>,
): ValueTypeOf<MobxObservable<T>> {
  switch (def.type) {
    case TypeDefType.Literal:
      return instantiateLiteral(def, value);
    case TypeDefType.List:
      // defaults to any type because we cannot supply the element type here
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return instantiateList(def, value) as ValueTypeOf<MobxObservable<T>>;
    case TypeDefType.Record:
      // defaults to any type because we cannot supply the field types here
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return instantiateRecord(def, value) as ValueTypeOf<MobxObservable<T>>;
    case TypeDefType.DiscriminatingUnion:
      // defaults to any type because we cannot supply the field types here
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return instantiateDiscriminatingUnion(def, value) as ValueTypeOf<MobxObservable<T>>;
    default:
      throw new UnreachableError(def);
  }
}

function instantiateLiteral<V>(_def: LiteralTypeDef<V>, value: V): V {
  return value;
}

function instantiateList<T extends ListTypeDef<E>, E extends TypeDef>(
  {
    elements,
  }: T,
  arr: ValueTypeOf<ReadonlyOf<T>>,
): ValueTypeOfList<T, {}> {
  const observables = arr.map(function (value) {
    return instantiate(elements, value);
  });
  return observable.array(
    observables,
    {
      deep: false,
    },
  );
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
  return observable(
    record,
    undefined,
    {
      deep: false,
    },
  ) as ValueTypeOfRecordFields<Fields, Extra>;
}

function instantiateRecord<
  T extends RecordTypeDef<Fields>,
  Fields extends ReadonlyRecord<RecordKey, RecordTypeDefField>,
>(
  {
    fields,
  }: T,
  value: ValueTypeOfRecord<T, {}>,
): ValueTypeOfRecord<T, {}> {
  const record = instantiateRecordFields(fields, value, {});
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return observable(
    record,
    undefined,
    {
      deep: false,
    },
  ) as ValueTypeOfRecord<T, {}>;
}

function instantiateDiscriminatingUnion<
  T extends DiscriminatingUnionTypeDef<D, U>,
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
  const record = instantiateRecordFields(
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
  );

  // record type only contains the current type of the discriminated union
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return observable(
    record,
    undefined,
    {
      deep: false,
    },
  ) as unknown as ValueTypeOfDiscriminatingUnion<T, {}>;
}

export const instantiateMobxObservable = instantiate;
