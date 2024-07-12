import { map } from 'base/record';
import { UnreachableError } from 'base/unreachable_error';
import {
  type DiscriminatingUnionTypeDef,
  type ListTypeDef,
  type LiteralTypeDef,
  type NullableTypeDef,
  type StructuredTypeDef,
  type StructuredTypeDefFields,
  type StructuredTypeField,
  type TypeDef,
  TypeDefType,
} from './definition';

// TODO make the top-level thing nullable if it not already nullable

export type PartialOf<F extends TypeDef> = F extends LiteralTypeDef ? PartialOfLiteral<F>
  : F extends NullableTypeDef ? PartialOfNullable<F>
  : F extends ListTypeDef ? PartialOfList<F>
  : F extends StructuredTypeDef ? PartialOfStruct<F>
  : F extends DiscriminatingUnionTypeDef ? PartialOfDiscriminatingUnion<F>
  : never;

type PartialOfLiteral<F extends LiteralTypeDef> = {
  type: TypeDefType.Literal,
  value: F['value'] | undefined,
};

type PartialOfNullable<F extends NullableTypeDef> = {
  type: TypeDefType.Nullable,
  nonNullableTypeDef: PartialOf<F['nonNullableTypeDef']>,
};

type PartialOfList<F extends ListTypeDef> = {
  type: TypeDefType.List,
  // TODO are lists of potentially undefined values appealing here?
  elements: PartialOf<F['elements']>,
  readonly: F['readonly'],
};

type PartialOfStructField<
  F extends StructuredTypeField,
> = StructuredTypeField<PartialOf<F['valueType']>, F['readonly'], true>;

type PartialOfStructFields<
  F extends StructuredTypeDefFields,
> = {
  [K in keyof F]: PartialOfStructField<F[K]>;
};

type PartialOfStruct<F extends StructuredTypeDef> = {
  readonly type: TypeDefType.Structured,
  readonly fields: PartialOfStructFields<F['fields']>,
};

type PartialOfDiscriminatingUnion<F extends DiscriminatingUnionTypeDef> = {
  readonly type: TypeDefType.DiscriminatingUnion,
  readonly discriminator: F['discriminator'],
  readonly unions: {
    [K in keyof F['unions']]: PartialOfStructFields<F['unions'][K]>;
  },
};

// TODO make everything nullable?
export function partialOf<T extends TypeDef>(t: T): PartialOf<T> {
  switch (t.type) {
    case TypeDefType.Literal:
      // converting the implicit any's back causes problems
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return partialOfLiteral(t) as PartialOf<T>;
    case TypeDefType.Nullable:
      // converting the implicit any's back causes problems
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return partialOfNullable(t) as PartialOf<T>;
    case TypeDefType.List:
      // converting the implicit any's back causes problems
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return partialOfList(t) as PartialOf<T>;
    case TypeDefType.Structured:
      // converting the implicit any's back causes problems
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return partialOfStruct(t) as PartialOf<T>;
    case TypeDefType.DiscriminatingUnion:
      // converting the implicit any's back causes problems
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return partialOfDiscriminatingUnion(t) as PartialOf<T>;
    default:
      throw new UnreachableError(t);
  }
}

function partialOfLiteral<T extends LiteralTypeDef>(_t: T): PartialOfLiteral<T> {
  return {
    type: TypeDefType.Literal,
    value: undefined,
  };
}

function partialOfNullable<T extends NullableTypeDef>({
  nonNullableTypeDef: valueType,
}: T) {
  return {
    type: TypeDefType.Nullable,
    nonNullableTypeDef: partialOf(valueType),
  };
}

function partialOfList<E extends TypeDef, T extends ListTypeDef<E>>({
  elements,
  readonly,
}: T): PartialOfList<T> {
  return {
    type: TypeDefType.List,
    elements: partialOf(elements),
    readonly,
  };
}

function partialOfStruct<F extends StructuredTypeDefFields, T extends StructuredTypeDef<F>>({
  fields,
}: T): PartialOfStruct<T> {
  return {
    type: TypeDefType.Structured,
    fields: partialOfStructFields(fields),
  };
}

function partialOfStructFields<T extends StructuredTypeDefFields>(fields: T): PartialOfStructFields<T> {
  // map implementation doesn't understand record structure and mapping function
  // TODO can we make it understand somehow?
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return map(fields, function (_, field) {
    return partialOfStructField(field);
  }) as PartialOfStructFields<T>;
}

function partialOfStructField<
  V extends TypeDef,
  Readonly extends boolean,
  Optional extends boolean,
  T extends StructuredTypeField<V, Readonly, Optional>,
>({
  readonly,
  valueType,
}: T): PartialOfStructField<T> {
  return {
    valueType: partialOf(valueType),
    readonly,
    optional: true,
  };
}

function partialOfDiscriminatingUnion<T extends DiscriminatingUnionTypeDef>({
  discriminator,
  unions,
}: T): PartialOfDiscriminatingUnion<T> {
  // map implementation doesn't understand record structure and mapping function
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {
    type: TypeDefType.DiscriminatingUnion,
    discriminator,
    unions: map(unions, function (_, union) {
      return partialOfStructFields(union);
    }),
  } as PartialOfDiscriminatingUnion<T>;
}
