import { reduce } from 'base/record';
import {
  type DiscriminatingUnionTypeDef,
  type ListTypeDef,
  type RecordTypeDef,
  type RecordTypeDefFields,
  type TypeDef,
  TypeDefType,
} from 'base/type/definition';
import {
  type FlattenedOf,
  prefixOf,
} from 'base/type/flattened_of';
import { type PathsOf } from 'base/type/paths_of';
import { type ValueTypeOf } from 'base/type/value_type_of';
import { UnreachableError } from 'base/unreachable_error';

type FlattenedValuesOf<T extends TypeDef> = Readonly<{
  [K in PathsOf<T>]: {
    readonly typePath: PathsOf<T, 'n'>,
    readonly value: ValueTypeOf<FlattenedOf<T>[K]>,
  };
}>;

type InternalFlattenedValues = Record<string, {
  readonly typePath: string,
  // gets cast to a type-safe value for callers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly value: any,
}>;

export function flatten<
  T extends TypeDef,
  Prefix extends string,
>(
  def: T,
  v: ValueTypeOf<T>,
  prefix: Prefix,
): FlattenedValuesOf<T> {
  const acc: InternalFlattenedValues = {};
  flattenInternal(acc, def, v, prefix, prefix);
  // cast to type-safe value
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return acc as FlattenedValuesOf<T>;
}

function flattenInternal(
  acc: InternalFlattenedValues,
  def: TypeDef,
  value: ValueTypeOf<TypeDef>,
  valuePath: string,
  typePath: string,
) {
  acc[valuePath] = {
    value,
    typePath,
  };
  switch (def.type) {
    case TypeDefType.Literal:
      return flattenLiteral(acc);
    case TypeDefType.List:
      return flattenList(acc, def, value, valuePath, typePath);
    case TypeDefType.Record:
      return flattenRecord(acc, def, value, valuePath, typePath);
    case TypeDefType.DiscriminatingUnion:
      return flattenDiscriminatingUnion(acc, def, value, valuePath, typePath);
    default:
      throw new UnreachableError(def);
  }
}

function flattenLiteral(acc: InternalFlattenedValues) {
  return acc;
}

function flattenList(
  acc: InternalFlattenedValues,
  def: ListTypeDef,
  value: ValueTypeOf<ListTypeDef>,
  valuePath: string,
  typePath: string,
) {
  const {
    elements,
  } = def;
  const elementTypePath = prefixOf(typePath, 'n');
  return value.reduce(
    function (acc, e, i) {
      const elementValuePath = prefixOf(valuePath, i);
      return flattenInternal(acc, elements, e, elementValuePath, elementTypePath);
    },
    acc,
  );
}

function flattenFields(
  acc: InternalFlattenedValues,
  fields: RecordTypeDefFields,
  // no way to know anything about the type here
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  valuePath: string,
  typePath: string,
) {
  return reduce(
    fields,
    function (acc, key, field): InternalFlattenedValues {
      return flattenInternal(
        acc,
        field.valueType,
        value[key],
        prefixOf(valuePath, key),
        prefixOf(typePath, key),
      );
    },
    acc,
  );
}

function flattenRecord(
  acc: InternalFlattenedValues,
  def: RecordTypeDef,
  value: ValueTypeOf<RecordTypeDef>,
  valuePath: string,
  typePath: string,
) {
  const {
    fields,
  } = def;
  return flattenFields(
    acc,
    fields,
    value,
    valuePath,
    typePath,
  );
}

function flattenDiscriminatingUnion(
  acc: InternalFlattenedValues,
  def: DiscriminatingUnionTypeDef,
  value: ValueTypeOf<DiscriminatingUnionTypeDef>,
  valuePath: string,
  typePath: string,
) {
  const {
    discriminator,
    unions,
  } = def;
  const disc = value[discriminator];
  const fields = unions[disc];
  acc[prefixOf(valuePath, discriminator)] = {
    value: disc,
    typePath: prefixOf(typePath, discriminator),
  };
  return flattenFields(
    acc,
    fields,
    value,
    valuePath,
    typePath,
  );
}
