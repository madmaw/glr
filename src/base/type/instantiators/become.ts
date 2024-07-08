import { forEach } from 'base/record';
import {
  type DiscriminatingUnionTypeDef,
  type ListTypeDef,
  type NullableTypeDef,
  type RecordTypeDef,
  type RecordTypeDefFields,
  type TypeDef,
  TypeDefType,
} from 'base/type/definition';
import { type ReadonlyOf } from 'base/type/readonly_of';
import { type ValueTypeOf } from 'base/type/value_type_of';
import { UnreachableError } from 'base/unreachable_error';

export type Instantiator<T extends TypeDef, R extends ValueTypeOf<T>> = (
  def: T,
  value: ValueTypeOf<ReadonlyOf<T>>,
) => R;

export function become<T extends TypeDef, R extends ValueTypeOf<T>>(
  def: T,
  instantiator: Instantiator<T, R>,
  target: R,
  prototype: ValueTypeOf<ReadonlyOf<T>>,
): R {
  return becomeInternal(
    def,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    instantiator as InternalInstantiator,
    target,
    prototype,
  );
}

type InternalInstantiator = Instantiator<TypeDef, ValueTypeOf<TypeDef>>;

function becomeInternal<T extends TypeDef>(
  def: T,
  instantiator: InternalInstantiator,
  target: ValueTypeOf<T>,
  prototype: ValueTypeOf<ReadonlyOf<T>>,
): ValueTypeOf<TypeDef> {
  switch (def.type) {
    case TypeDefType.Literal:
      return becomeLiteral(prototype);
    case TypeDefType.Nullable:
      return becomeNullable(def, instantiator, target, prototype);
    case TypeDefType.List:
      return becomeList(def, instantiator, target, prototype);
    case TypeDefType.Record:
      return becomeRecord(def, instantiator, target, prototype);
    case TypeDefType.DiscriminatingUnion:
      return becomeDiscriminatingUnion(def, instantiator, target, prototype);
    default:
      throw new UnreachableError(def);
  }
}

function becomeLiteral(prototype: ValueTypeOf<ReadonlyOf<TypeDef>>): ValueTypeOf<TypeDef> {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return prototype as ValueTypeOf<TypeDef>;
}

function becomeNullable(
  {
    nonNullableTypeDef: valueType,
  }: NullableTypeDef,
  instantiator: InternalInstantiator,
  target: ValueTypeOf<ListTypeDef>,
  prototype: ValueTypeOf<ReadonlyOf<NullableTypeDef>>,
): ValueTypeOf<NullableTypeDef> {
  if (prototype == null) {
    return null;
  }
  return becomeInternal(valueType, instantiator, target, prototype);
}

function becomeList(
  {
    elements,
  }: ListTypeDef,
  instantiator: InternalInstantiator,
  target: ValueTypeOf<ListTypeDef>,
  prototype: ValueTypeOf<ReadonlyOf<ListTypeDef>>,
): ValueTypeOf<ListTypeDef> {
  // (rudimentary) diff the array elements
  // TODO consider minimal diff
  for (let i = 0; i < Math.min(target.length, prototype.length); i++) {
    const targetValue = target[i];
    const prototypeValue = prototype[i];
    const value = becomeInternal(elements, instantiator, targetValue, prototypeValue);
    if (targetValue[i] !== value) {
      target[i] = value;
    }
  }
  if (target.length < prototype.length) {
    // create any additional elements
    for (let i = target.length; i < prototype.length; i++) {
      target.push(instantiator(elements, prototype[i]));
    }
  } else {
    // remove any trailing elements
    target.splice(prototype.length, target.length - prototype.length);
  }
  return target;
}

function becomeRecordFields(
  fields: RecordTypeDefFields,
  instantiator: InternalInstantiator,
  target: ValueTypeOf<RecordTypeDef>,
  prototype: ValueTypeOf<RecordTypeDef>,
) {
  forEach(fields, function (key, {
    valueType,
    optional,
  }) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
    const targetValue = (target as any)[key];
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
    const prototypeValue = (prototype as any)[key];
    const value = optional && prototypeValue === undefined
      ? prototypeValue
      : optional && targetValue === undefined
      ? instantiator(valueType, prototypeValue)
      : becomeInternal(valueType, instantiator, targetValue, prototypeValue);
    if (value !== targetValue) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
      (target as any)[key] = value;
    }
  });
  return target;
}

function becomeRecord(
  {
    fields,
  }: RecordTypeDef,
  instantiator: InternalInstantiator,
  target: ValueTypeOf<RecordTypeDef>,
  prototype: ValueTypeOf<RecordTypeDef>,
): ValueTypeOf<RecordTypeDef> {
  return becomeRecordFields(fields, instantiator, target, prototype);
}

function becomeDiscriminatingUnion(
  def: DiscriminatingUnionTypeDef,
  instantiator: InternalInstantiator,
  target: ValueTypeOf<DiscriminatingUnionTypeDef>,
  prototype: ValueTypeOf<DiscriminatingUnionTypeDef>,
): ValueTypeOf<DiscriminatingUnionTypeDef> {
  const {
    discriminator,
    unions,
  } = def;
  const targetDiscriminator = target[discriminator];
  const prototypeDiscriminator = prototype[discriminator];
  if (targetDiscriminator !== prototypeDiscriminator) {
    // if the discriminator changed, we have to recreate
    // TODO there is a corner case where the unions of the discriminators are otherwise the same
    // not sure if it's ever worth considering
    return instantiator(def, prototype);
  }
  const fields = unions[targetDiscriminator];
  return becomeRecordFields(fields, instantiator, target, prototype);
}
