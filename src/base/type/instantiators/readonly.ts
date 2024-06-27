import {
  type TypeDef,
  TypeDefType,
} from 'base/type/definition';
import { type ReadonlyOf } from 'base/type/readonly_of';
import { type TypeOf } from 'base/type/type_of';
import { UnreachableError } from 'base/unreachable_error';

// creates an immutable copy of the supplied value
export function instantiate<T extends TypeDef>(
  def: T,
  value: TypeOf<ReadonlyOf<T>>,
): TypeOf<ReadonlyOf<T>> {
  switch (def.type) {
    case TypeDefType.Literal:
      return value;
    case TypeDefType.List:
      return null!;
    case TypeDefType.Record:
      return null!;
    case TypeDefType.DiscriminatingUnion:
      return null!;
    default:
      throw new UnreachableError(def);
  }
}
