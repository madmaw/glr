import { map } from 'base/record';
import { UnreachableError } from 'base/unreachable_error';
import {
  type DiscriminatingUnionTypeDef,
  type ListTypeDef,
  type LiteralTypeDef,
  type NullableTypeDef,
  type RecordTypeDef,
  type RecordTypeDefField,
  type RecordTypeDefFields,
  type TypeDef,
  TypeDefType,
} from './definition';

// TODO rename to `PartialOf`
export type PartialOf<F extends TypeDef> = F extends LiteralTypeDef ? PartialOfLiteral<F>
  : F extends NullableTypeDef ? PartialOfNullable<F>
  : F extends ListTypeDef ? PartialOfList<F>
  : F extends RecordTypeDef ? PartialOfRecord<F>
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

type PartialOfRecordField<
  F extends RecordTypeDefField,
> = RecordTypeDefField<PartialOf<F['valueType']>, F['readonly'], true>;

type PartialOfRecordFields<
  F extends RecordTypeDefFields,
> = {
  [K in keyof F]: PartialOfRecordField<F[K]>;
};

type PartialOfRecord<F extends RecordTypeDef> = {
  readonly type: TypeDefType.Record,
  readonly fields: PartialOfRecordFields<F['fields']>,
};

type PartialOfDiscriminatingUnion<F extends DiscriminatingUnionTypeDef> = {
  readonly type: TypeDefType.DiscriminatingUnion,
  readonly discriminator: F['discriminator'],
  readonly unions: {
    [K in keyof F['unions']]: PartialOfRecordFields<F['unions'][K]>;
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
    case TypeDefType.Record:
      // converting the implicit any's back causes problems
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return partialOfRecord(t) as PartialOf<T>;
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

function partialOfRecord<F extends RecordTypeDefFields, T extends RecordTypeDef<F>>({
  fields,
}: T): PartialOfRecord<T> {
  return {
    type: TypeDefType.Record,
    fields: partialOfRecordFields(fields),
  };
}

function partialOfRecordFields<T extends RecordTypeDefFields>(fields: T): PartialOfRecordFields<T> {
  // map implementation doesn't understand record structure and mapping function
  // TODO can we make it understand somehow?
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return map(fields, function (_, field) {
    return partialOfRecordField(field);
  }) as PartialOfRecordFields<T>;
}

function partialOfRecordField<
  V extends TypeDef,
  Readonly extends boolean,
  Optional extends boolean,
  T extends RecordTypeDefField<V, Readonly, Optional>,
>({
  readonly,
  valueType,
}: T): PartialOfRecordField<T> {
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
      return partialOfRecordFields(union);
    }),
  } as PartialOfDiscriminatingUnion<T>;
}
