import { map } from 'base/record';
import { UnreachableError } from 'base/unreachable_error';
import {
  type DiscriminatingUnionTypeDef,
  type ListTypeDef,
  type LiteralTypeDef,
  type MapKeyType,
  type MapTypeDef,
  type NullableTypeDef,
  type StructuredTypeDef,
  type StructuredTypeDefFields,
  type StructuredTypeField,
  type TypeDef,
  TypeDefType,
} from './definition';

export type ReadonlyOf<F extends TypeDef> = F extends LiteralTypeDef ? ReadonlyOfLiteral<F>
  : F extends NullableTypeDef ? ReadonlyOfNullable<F>
  : F extends ListTypeDef ? ReadonlyOfList<F>
  : F extends MapTypeDef ? ReadonlyOfMap<F>
  : F extends StructuredTypeDef ? ReadonlyOfStruct<F>
  : F extends DiscriminatingUnionTypeDef ? ReadonlyOfDiscriminatingUnion<F>
  : never;

type ReadonlyOfLiteral<F extends LiteralTypeDef> = {
  readonly type: TypeDefType.Literal,
  readonly valuePrototype: F['valuePrototype'],
};

type ReadonlyOfNullable<F extends NullableTypeDef> = {
  readonly type: TypeDefType.Nullable,
  readonly nonNullableTypeDef: ReadonlyOf<F['nonNullableTypeDef']>,
};

export type ReadonlyOfList<F extends ListTypeDef> = {
  readonly type: TypeDefType.List,
  readonly elements: ReadonlyOf<F['elements']>,
  readonly readonly: true,
};

type ReadonlyOfMap<F extends MapTypeDef> = {
  readonly type: TypeDefType.Map,
  readonly keyPrototype: F['keyPrototype'],
  readonly valueType: ReadonlyOf<F['valueType']>,
  readonly readonly: true,
  readonly partial: F['partial'],
};

type ReadonlyOfStructField<
  F extends StructuredTypeField,
> = StructuredTypeField<ReadonlyOf<F['valueType']>, true, F['optional']>;

type ReadonlyOfStructFields<F extends StructuredTypeDefFields> = {
  [K in keyof F]: ReadonlyOfStructField<F[K]>;
};

export type ReadonlyOfStruct<F extends StructuredTypeDef> = {
  type: TypeDefType.Structured,
  fields: ReadonlyOfStructFields<F['fields']>,
};

export type ReadonlyOfDiscriminatingUnion<
  F extends DiscriminatingUnionTypeDef,
> = {
  readonly type: TypeDefType.DiscriminatingUnion,
  readonly discriminator: F['discriminator'],
  readonly unions: {
    [K in keyof F['unions']]: ReadonlyOfStructFields<F['unions'][K]>;
  },
};

export function readonlyOf<T extends TypeDef>(t: T): ReadonlyOf<T> {
  switch (t.type) {
    case TypeDefType.Literal:
      // converting the implicit any's back causes problems
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return readonlyOfLiteral(t) as ReadonlyOf<T>;
    case TypeDefType.Nullable:
      // converting the implicit any's back causes problems
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return readonlyOfNullable(t) as ReadonlyOf<T>;
    case TypeDefType.List:
      // converting the implicit any's back causes problems
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return readonlyOfList(t) as ReadonlyOf<T>;
    case TypeDefType.Map:
      // converting the implicit any's back causes problems
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return readonlyOfMap(t) as ReadonlyOf<T>;
    case TypeDefType.Structured:
      // converting the implicit any's back causes problems
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return readonlyOfStruct(t) as ReadonlyOf<T>;
    case TypeDefType.DiscriminatingUnion:
      // converting the implicit any's back causes problems
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return readonlyOfDiscriminatingUnion(t) as ReadonlyOf<T>;
    default:
      throw new UnreachableError(t);
  }
}

function readonlyOfLiteral<T extends LiteralTypeDef>({
  valuePrototype,
}: T): ReadonlyOfLiteral<T> {
  return {
    type: TypeDefType.Literal,
    valuePrototype,
  };
}

function readonlyOfNullable<
  N extends TypeDef,
  T extends NullableTypeDef<N>,
>({ nonNullableTypeDef: valueType }: T): ReadonlyOfNullable<T> {
  return {
    type: TypeDefType.Nullable,
    nonNullableTypeDef: readonlyOf(valueType),
  };
}

function readonlyOfList<E extends TypeDef, T extends ListTypeDef<E>>({
  elements,
}: T): ReadonlyOfList<T> {
  return {
    type: TypeDefType.List,
    elements: readonlyOf(elements),
    readonly: true,
  };
}

function readonlyOfMap<K extends MapKeyType, V extends TypeDef, T extends MapTypeDef<K, V>>({
  keyPrototype,
  valueType,
  partial,
}: T): ReadonlyOfMap<T> {
  return {
    type: TypeDefType.Map,
    keyPrototype,
    valueType: readonlyOf(valueType),
    readonly: true,
    partial,
  };
}

function readonlyOfStruct<F extends StructuredTypeDefFields, T extends StructuredTypeDef<F>>({
  fields,
}: T): ReadonlyOfStruct<T> {
  return {
    type: TypeDefType.Structured,
    fields: readonlyOfStructFields(fields),
  };
}

function readonlyOfStructFields<T extends StructuredTypeDefFields>(fields: T): ReadonlyOfStructFields<T> {
  // map implementation doesn't understand record structure and mapping function
  // TODO can we make it understand somehow?
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return map(fields, function (_, field) {
    return readonlyOfStructField(field);
  }) as ReadonlyOfStructFields<T>;
}

function readonlyOfStructField<
  V extends TypeDef,
  Readonly extends boolean,
  Optional extends boolean,
  T extends StructuredTypeField<V, Readonly, Optional>,
>({
  optional,
  valueType,
}: T): ReadonlyOfStructField<T> {
  return {
    valueType: readonlyOf(valueType),
    optional,
    readonly: true,
  };
}

function readonlyOfDiscriminatingUnion<T extends DiscriminatingUnionTypeDef>({
  discriminator,
  unions,
}: T): ReadonlyOfDiscriminatingUnion<T> {
  // map implementation doesn't understand record structure and mapping function
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {
    type: TypeDefType.DiscriminatingUnion,
    discriminator,
    unions: map(unions, function (_, union) {
      return readonlyOfStructFields(union);
    }),
  } as ReadonlyOfDiscriminatingUnion<T>;
}
