import { type MobxObservable } from 'base/mobx';
import {
  type DiscriminatedUnionTypeDef,
  type ListTypeDef,
  type LiteralTypeDef,
  type RecordKey,
  type RecordTypeDefFields,
  type TypeDef,
  TypeDefType,
} from 'base/type/definition';
import { type ReadonlyOf } from 'base/type/readonly_of';
import {
  type TypeOf,
  type TypeOfDiscriminatedUnion,
  type TypeOfList,
  type TypeOfRecord,
} from 'base/type/type_of';
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
  value: TypeOf<ReadonlyOf<T>>,
): TypeOf<T, MobxObservable> {
  switch (def.type) {
    case TypeDefType.Literal:
      return instantiateLiteral(def, value);
    case TypeDefType.List:
      // defaults to any type because we cannot supply the element type here
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return instantiateList(def, value) as TypeOf<T, MobxObservable>;
    case TypeDefType.Record:
      // defaults to any type because we cannot supply the field types here
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return instantiateRecord(def, value, {}) as TypeOf<T, MobxObservable>;
    case TypeDefType.DiscriminatedUnion:
      // defaults to any type because we cannot supply the field types here
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return instantiateDiscriminatedUnion(def, value) as TypeOf<T, MobxObservable>;
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
  arr: TypeOf<ReadonlyOf<T>>,
): TypeOfList<T, {}> {
  return observable.array(...arr.map(function (value) {
    return instantiate(elements, value);
  }), {
    deep: false,
  });
}

function instantiateRecord<
  T extends RecordTypeDefFields<MutableFields, MutableOptionalFields, ReadonlyFields, ReadonlyOptionalFields>,
  MutableFields extends Record<RecordKey, TypeDef>,
  MutableOptionalFields extends Record<RecordKey, TypeDef>,
  ReadonlyFields extends Record<RecordKey, TypeDef>,
  ReadonlyOptionalFields extends Record<RecordKey, TypeDef>,
  Extra,
>(
  {
    mutableFields,
    mutableOptionalFields,
    readonlyFields,
    readonlyOptionalFields,
  }: T,
  value: TypeOfRecord<T, {}>,
  extra: Extra,
): TypeOfRecord<T, Extra> {
  const record = [
    mutableFields,
    mutableOptionalFields,
    readonlyFields,
    readonlyOptionalFields,
  ].reduce(
    function (acc, fields) {
      return Object.entries(fields).reduce(function (acc, [
        key,
        fieldDef,
      ]) {
        acc[key] = instantiate(fieldDef, value[key]);
        return acc;
      }, acc);
    },
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
    extra as Record<string, any>,
  );
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return observable(
    record,
    undefined,
    {
      deep: false,
    },
  ) as TypeOfRecord<T, Extra>;
}

function instantiateDiscriminatedUnion<
  T extends DiscriminatedUnionTypeDef<D, U>,
  D extends string,
  U extends Record<RecordKey, RecordTypeDefFields>,
>(
  {
    discriminator,
    options,
  }: T,
  value: TypeOfDiscriminatedUnion<T, {}>,
): TypeOfDiscriminatedUnion<T, {}> {
  const discriminatorValue = value[discriminator];
  // record type only contains the current type of the discriminated union
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return instantiateRecord(
    options[discriminatorValue],
    value,
    // because discriminator can technically have multiple valid keys
    // e.g. `DiscriminatorUnionTypeDef<'x' | 'y', {}>`
    // this type can never match
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    {
      [discriminator]: discriminatorValue,
    } as unknown as {
      [K in D]: keyof U;
    },
  ) as TypeOfDiscriminatedUnion<T, {}>;
}

export const mobxObservableInstantiator = instantiate;

const n: LiteralTypeDef<1 | 3 | 5> = {
  type: TypeDefType.Literal,
  value: undefined!,
};

const a: ListTypeDef<typeof n, true> = {
  type: TypeDefType.List,
  elements: n,
  readonly: true,
};

const c = {
  type: TypeDefType.Record,
  mutableFields: {},
  mutableOptionalFields: {
    m: n,
  },
  readonlyFields: {},
  readonlyOptionalFields: {},
} as const;

const r = {
  type: TypeDefType.Record,
  mutableFields: {
    m: n,
  },
  mutableOptionalFields: {
    om: a,
  },
  readonlyFields: {
    r: n,
  },
  readonlyOptionalFields: {
    or: c,
  },
} as const;

const ri: TypeOf<typeof r> = {
  m: 1,
  om: [3],
  r: 1,
  or: {},
};

const robs = instantiate(r, ri);
