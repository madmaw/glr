import {
  type TypeDef,
  TypeDefType,
} from 'base/type/definition';
import { type ReadonlyOf } from 'base/type/readonly_of';
import { type ValueTypeOf } from 'base/type/value_type_of';
import { instantiateCopy } from './copy';

function freezeValue<T extends TypeDef>(value: ValueTypeOf<T>, def: T): ValueTypeOf<ReadonlyOf<T>> {
  if (value == null || def.type === TypeDefType.Literal) {
    // don't freeze literal values as they already should be immutable
    // null/undefined/literal don't qualify as readonly for some reason
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return value as ValueTypeOf<ReadonlyOf<T>>;
  }
  return Object.freeze(value);
}

// creates an immutable copy of the supplied value
export function instantiateFrozen<T extends TypeDef>(
  def: T,
  value: ValueTypeOf<ReadonlyOf<T>>,
) {
  return instantiateCopy<T, ValueTypeOf<ReadonlyOf<T>>>(def, value, freezeValue);
}
