import { reduce } from 'base/record';
import {
  type DiscriminatingUnionTypeDef,
  type ListTypeDef,
  type NullableTypeDef,
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

export type FlattenedValuesOf<T extends TypeDef, Prefix extends string> = Readonly<{
  [K in PathsOf<T, Prefix>]: {
    readonly typePath: PathsOf<T, Prefix>,
    // causes typescript type checker to eventually complain about an infinite loop
    // @ts-expect-error expected
    readonly value: ValueTypeOf<FlattenedOf<T, Prefix>[K]>,
    // @ts-expect-error expected
    readonly setValue?: (value: ValueTypeOf<FlattenedOf<T, Prefix>[K]>) => void,
  };
}>;

type InternalFlattenedValues = Record<string, {
  readonly typePath: string,
  readonly value: ValueTypeOf<TypeDef>,
  readonly setValue?: (value: ValueTypeOf<TypeDef>) => void,
}>;

export function flatten<
  T extends TypeDef,
  Prefix extends string,
>(
  def: T,
  v: ValueTypeOf<T>,
  prefix: Prefix,
): FlattenedValuesOf<T, Prefix> {
  const acc: InternalFlattenedValues = {};
  flattenInternal(acc, def, v, prefix, prefix, undefined);
  // cast to type-safe value
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
  return acc as any;
}

function flattenInternal(
  acc: InternalFlattenedValues,
  def: TypeDef,
  value: ValueTypeOf<TypeDef>,
  valuePath: string,
  typePath: string,
  setValue: ((value: ValueTypeOf<TypeDef>) => void) | undefined,
): InternalFlattenedValues {
  acc[valuePath] = {
    value,
    typePath,
    setValue,
  };
  switch (def.type) {
    case TypeDefType.Literal:
      return flattenLiteral(acc);
    case TypeDefType.Nullable:
      return flattenNullable(acc, def, value, valuePath, typePath, setValue);
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

function flattenNullable(
  acc: InternalFlattenedValues,
  {
    nonNullableTypeDef: valueType,
  }: NullableTypeDef,
  value: ValueTypeOf<NullableTypeDef>,
  valuePath: string,
  typePath: string,
  setValue: ((value: ValueTypeOf<TypeDef>) => void) | undefined,
): InternalFlattenedValues {
  if (value != null) {
    return flattenInternal(acc, valueType, value, valuePath, typePath, setValue);
  }
  return acc;
}

function flattenList(
  acc: InternalFlattenedValues,
  def: ListTypeDef,
  value: ValueTypeOf<ListTypeDef>,
  valuePath: string,
  typePath: string,
): InternalFlattenedValues {
  const {
    elements,
  } = def;
  const elementTypePath = prefixOf(typePath, 'n');
  return value.reduce(
    function (
      acc: InternalFlattenedValues,
      e: ValueTypeOf<TypeDef>,
      i: number,
    ) {
      const elementValuePath = prefixOf(valuePath, i);
      const setValue = function (newValue: ValueTypeOf<TypeDef>) {
        value[i] = newValue;
      };
      return flattenInternal(acc, elements, e, elementValuePath, elementTypePath, setValue);
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
      const setValue = function (newValue: ValueTypeOf<TypeDef>) {
        value[key] = newValue;
      };
      return flattenInternal(
        acc,
        field.valueType,
        value[key],
        prefixOf(valuePath, key),
        prefixOf(typePath, key),
        setValue,
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
    prefixOf(valuePath, disc),
    prefixOf(typePath, disc),
  );
}
