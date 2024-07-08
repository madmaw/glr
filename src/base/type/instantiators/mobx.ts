import { type MobxObservable } from 'base/mobx';
import { reduce } from 'base/record';
import {
  type TypeDef,
  TypeDefType,
} from 'base/type/definition';
import { type ReadonlyOf } from 'base/type/readonly_of';
import { type ValueTypeOf } from 'base/type/value_type_of';
import { UnreachableError } from 'base/unreachable_error';
import {
  type IObservableFactory,
  makeObservable,
  observable,
} from 'mobx';
import { become } from './become';
import { instantiateCopy } from './copy';

function observeValue<T extends TypeDef>(
  v: ValueTypeOf<T>,
  def: T,
): ValueTypeOf<T> {
  if (v == null) {
    return v;
  }
  switch (def.type) {
    case TypeDefType.Literal:
      return v;
    case TypeDefType.Nullable:
      if (v != null) {
        return observeValue(v, def.nonNullableTypeDef);
      } else {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        return null as ValueTypeOf<T>;
      }
    case TypeDefType.List:
      if (!def.readonly) {
        // can't work out that an observable array is an array
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
        return observable.array(v as any[], { deep: false }) as any;
      } else {
        return v;
      }
    case TypeDefType.Record:
      return makeObservable(
        v,
        reduce(
          def.fields,
          function (acc, k, v) {
            if (!v.readonly) {
              acc[k] = observable;
            }
            return acc;
          },
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          {} as Record<string, IObservableFactory>,
        ),
        {
          deep: false,
        },
      );
    case TypeDefType.DiscriminatingUnion:
      return makeObservable(
        v,
        reduce(
          def.unions[v[def.discriminator]],
          function (acc, k, v) {
            if (!v.readonly) {
              acc[k] = observable;
            }
            return acc;
          },
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          {} as Record<string, IObservableFactory>,
        ),
        {
          deep: false,
        },
      );
    default:
      throw new UnreachableError(def);
  }
}

export type MobxValueTypeOf<T extends TypeDef> = ValueTypeOf<T, MobxObservable>;

/**
 * Creates a mobx observable copy of the supplied value
 * @param def description of the object to create
 * @param value the value to populate the object from
 * @returns the observable copy of the supplied value
 */
export function instantiateMobxObservable<T extends TypeDef>(
  def: T,
  value: ValueTypeOf<ReadonlyOf<T>>,
): MobxValueTypeOf<T> {
  return instantiateCopy<T, MobxValueTypeOf<T>>(def, value, observeValue);
}

export function becomeMobxObservable<T extends TypeDef>(
  def: T,
  target: MobxValueTypeOf<T>,
  value: ValueTypeOf<ReadonlyOf<T>>,
): MobxValueTypeOf<T> {
  return become<T, MobxValueTypeOf<T>>(def, instantiateMobxObservable, target, value);
}
