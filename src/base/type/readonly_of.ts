import { map } from 'base/record';
import { UnreachableError } from 'base/unreachable_error';
import {
  type DiscriminatingUnionTypeDef,
  type ListTypeDef,
  type LiteralTypeDef,
  type RecordTypeDef,
  type RecordTypeDefField,
  type RecordTypeDefFields,
  type TypeDef,
  TypeDefType,
} from './definition';

export type ReadonlyOf<F extends TypeDef> = F extends LiteralTypeDef ? ReadonlyOfLiteral<F>
  : F extends ListTypeDef ? ReadonlyOfList<F>
  : F extends RecordTypeDef ? ReadonlyOfRecord<F>
  : F extends DiscriminatingUnionTypeDef ? ReadonlyOfDiscriminatingUnion<F>
  : never;

type ReadonlyOfLiteral<F extends LiteralTypeDef> = {
  readonly type: TypeDefType.Literal,
  readonly value: F['value'],
};

export type ReadonlyOfList<F extends ListTypeDef> = {
  readonly type: TypeDefType.List,
  readonly elements: ReadonlyOf<F['elements']>,
  readonly readonly: true,
};

type ReadonlyOfRecordField<
  F extends RecordTypeDefField,
> = RecordTypeDefField<ReadonlyOf<F['valueType']>, true, F['optional']>;

type ReadonlyOfRecordFields<F extends RecordTypeDefFields> = {
  [K in keyof F]: ReadonlyOfRecordField<F[K]>;
};

export type ReadonlyOfRecord<F extends RecordTypeDef> = {
  type: TypeDefType.Record,
  fields: ReadonlyOfRecordFields<F['fields']>,
};

export type ReadonlyOfDiscriminatingUnion<
  F extends DiscriminatingUnionTypeDef,
> = {
  readonly type: TypeDefType.DiscriminatingUnion,
  readonly discriminator: F['discriminator'],
  readonly unions: {
    [K in keyof F['unions']]: ReadonlyOfRecordFields<F['unions'][K]>;
  },
};

export function readonlyOf<T extends TypeDef>(t: T): ReadonlyOf<T> {
  switch (t.type) {
    case TypeDefType.Literal:
      // converting the implicit any's back causes problems
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return readonlyOfLiteral(t) as ReadonlyOf<T>;
    case TypeDefType.List:
      // converting the implicit any's back causes problems
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return readonlyOfList(t) as ReadonlyOf<T>;
    case TypeDefType.Record:
      // converting the implicit any's back causes problems
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return readonlyOfRecord(t) as ReadonlyOf<T>;
    case TypeDefType.DiscriminatingUnion:
      // converting the implicit any's back causes problems
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return readonlyOfDiscriminatingUnion(t) as ReadonlyOf<T>;
    default:
      throw new UnreachableError(t);
  }
}

function readonlyOfLiteral<T extends LiteralTypeDef>({
  value,
}: T): ReadonlyOfLiteral<T> {
  return {
    type: TypeDefType.Literal,
    value,
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

function readonlyOfRecord<F extends RecordTypeDefFields, T extends RecordTypeDef<F>>({
  fields,
}: T): ReadonlyOfRecord<T> {
  return {
    type: TypeDefType.Record,
    fields: readonlyOfRecordFields(fields),
  };
}

function readonlyOfRecordFields<T extends RecordTypeDefFields>(fields: T): ReadonlyOfRecordFields<T> {
  // map implementation doesn't understand record structure and mapping function
  // TODO can we make it understand somehow?
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return map(fields, function (_, field) {
    return readonlyOfRecordField(field);
  }) as ReadonlyOfRecordFields<T>;
}

function readonlyOfRecordField<
  V extends TypeDef,
  Readonly extends boolean,
  Optional extends boolean,
  T extends RecordTypeDefField<V, Readonly, Optional>,
>({
  optional,
  valueType,
}: T): ReadonlyOfRecordField<T> {
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
      return readonlyOfRecordFields(union);
    }),
  } as ReadonlyOfDiscriminatingUnion<T>;
}
