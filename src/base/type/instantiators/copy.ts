import {
  map,
  reduce,
} from 'base/record';
import {
  type DiscriminatingUnionTypeDef,
  type ListTypeDef,
  type MapTypeDef,
  type NullableTypeDef,
  type StructuredFieldKey,
  type StructuredTypeDef,
  type StructuredTypeField,
  type TypeDef,
  TypeDefType,
} from 'base/type/definition';
import { type ReadonlyOf } from 'base/type/readonly_of';
import {
  type ValueTypeOf,
  type ValueTypeOfStructFields,
} from 'base/type/value_type_of';
import { UnreachableError } from 'base/unreachable_error';

type Modifier<V, R> = (v: V, t: TypeDef) => R;

function passThroughModifier<T extends TypeDef>(v: ValueTypeOf<T>) {
  return v;
}

/**
 * Creates a copy of the supplied value
 * @param def description of the object to create
 * @param value the value to populate the object from
 * @returns a copy of the supplied value
 */
function instantiate<T extends TypeDef, R extends (ValueTypeOf<ReadonlyOf<T>> | ValueTypeOf<T>)>(
  def: T,
  value: ValueTypeOf<ReadonlyOf<T>>,
  modifier: Modifier<ValueTypeOf<TypeDef>, R> = passThroughModifier<T>,
): R {
  switch (def.type) {
    case TypeDefType.Literal:
      return instantiateLiteral(
        def,
        value,
        modifier,
      );
    case TypeDefType.Nullable:
      return instantiateNullable(
        def,
        value,
        modifier,
      );
    case TypeDefType.List:
      return instantiateList(
        def,
        value,
        modifier,
      );
    case TypeDefType.Map:
      return instantiateMap(
        def,
        value,
        modifier,
      );
    case TypeDefType.Structured:
      return instantiateStruct(
        def,
        value,
        modifier,
      );
    case TypeDefType.DiscriminatingUnion:
      return instantiateDiscriminatingUnion(
        def,
        value,
        modifier,
      );
    default:
      throw new UnreachableError(def);
  }
}

function instantiateLiteral<
  T extends TypeDef,
  R extends (ValueTypeOf<ReadonlyOf<T>> | ValueTypeOf<T>),
>(
  def: T,
  value: ValueTypeOf<ReadonlyOf<T>>,
  modifier: Modifier<ValueTypeOf<T>, R>,
): R {
  // mutable and immutable literals should be the same type
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const v = value as ValueTypeOf<T>;
  return modifier(v, def);
}

function instantiateNullable<
  T extends TypeDef,
  R extends (ValueTypeOf<ReadonlyOf<T>> | ValueTypeOf<T>),
>(
  def: NullableTypeDef,
  value: ValueTypeOf<ReadonlyOf<T>>,
  modifier: Modifier<ValueTypeOf<T>, R>,
): R {
  const {
    nonNullableTypeDef,
  } = def;
  if (value == null) {
    // mutable and immutable null should be the same type
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return modifier(null as ValueTypeOf<T>, def);
  }
  return instantiate(nonNullableTypeDef, value, modifier);
}

function instantiateList<
  T extends TypeDef,
  R extends (ValueTypeOf<ReadonlyOf<T>> | ValueTypeOf<T>),
>(
  def: ListTypeDef,
  arr: ValueTypeOf<ReadonlyOf<ListTypeDef>>,
  modifier: Modifier<ValueTypeOf<T>, R>,
): R {
  const {
    elements,
  } = def;
  const list = arr.map(function (value) {
    return instantiate(elements, value);
  });
  return modifier(
    // TODO: work out a way of maintaining the list type instead of casting
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    list as ValueTypeOf<T>,
    def,
  );
}

function instantiateMap<
  T extends TypeDef,
  R extends (ValueTypeOf<ReadonlyOf<T>> | ValueTypeOf<T>),
>(
  def: MapTypeDef,
  value: ValueTypeOf<ReadonlyOf<T>>,
  modifier: Modifier<ValueTypeOf<T>, R>,
): R {
  const {
    valueType,
  } = def;
  const record = map(
    value,
    function (_key, value) {
      return instantiate(valueType, value);
    },
  );
  return modifier(
    // TODO: work out a way of maintaining the list type instead of casting
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    record as ValueTypeOf<T>,
    def,
  );
}

function instantiateStructFields<
  Fields extends Record<StructuredFieldKey, StructuredTypeField>,
  Extra,
>(
  fields: Fields,
  value: ValueTypeOfStructFields<Fields, {}>,
  extra: Extra,
): ValueTypeOfStructFields<Fields, Extra> {
  const record = reduce(fields, function (acc, key, field) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
    const fieldValue = (value as any)[key];
    // only interested in `undefined` values as `null` values are handled by nullable type def
    if (!field.optional || fieldValue !== undefined) {
      acc[key] = instantiate(field.valueType, fieldValue);
    }
    return acc;
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
  }, extra as Record<string, any>);
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return record as ValueTypeOfStructFields<Fields, Extra>;
}

function instantiateStruct<
  T extends TypeDef,
  R extends (ValueTypeOf<ReadonlyOf<T>> | ValueTypeOf<T>),
>(
  def: StructuredTypeDef,
  value: ValueTypeOf<ReadonlyOf<T>>,
  modifier: Modifier<ValueTypeOf<T>, R>,
): R {
  const {
    fields,
  } = def;
  const record = instantiateStructFields(fields, value, {});
  // TODO: work out a way of maintaining the record type instead of casting
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return modifier(record as ValueTypeOf<T>, def);
}

function instantiateDiscriminatingUnion<
  T extends TypeDef,
  R extends (ValueTypeOf<ReadonlyOf<T>> | ValueTypeOf<T>),
>(
  def: DiscriminatingUnionTypeDef,
  value: ValueTypeOf<ReadonlyOf<T>>,
  modifier: Modifier<ValueTypeOf<T>, R>,
): R {
  const {
    discriminator,
    unions,
  } = def;
  const discriminatorValue = value[discriminator];
  const discriminatingUnion = instantiateStructFields(
    unions[discriminatorValue],
    value,
    {
      [discriminator]: discriminatorValue,
    },
  );
  // TODO: work out a way of maintaining the discriminating union type instead of casting
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return modifier(discriminatingUnion as ValueTypeOf<T>, def);
}

export const instantiateCopy = instantiate;
