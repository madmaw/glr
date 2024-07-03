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

export type OptionalOf<F extends TypeDef> = F extends LiteralTypeDef ? OptionalOfLiteral<F>
  : F extends ListTypeDef ? OptionalOfList<F>
  : F extends RecordTypeDef ? OptionalOfRecord<F>
  : F extends DiscriminatingUnionTypeDef ? OptionalOfDiscriminatingUnion<F>
  : never;

type OptionalOfLiteral<F extends LiteralTypeDef> = {
  type: TypeDefType.Literal,
  value: F['value'] | undefined,
};

type OptionalOfList<F extends ListTypeDef> = {
  type: TypeDefType.List,
  // TODO are lists of potentially undefined values appealing here?
  elements: OptionalOf<F['elements']>,
  readonly: F['readonly'],
};

type OptionalOfRecordField<
  F extends RecordTypeDefField,
> = RecordTypeDefField<OptionalOf<F['valueType']>, F['readonly'], true>;

type OptionalOfRecordFields<
  F extends RecordTypeDefFields,
> = {
  [K in keyof F]: OptionalOfRecordField<F[K]>;
};

type OptionalOfRecord<F extends RecordTypeDef> = {
  readonly type: TypeDefType.Record,
  readonly fields: OptionalOfRecordFields<F['fields']>,
};

type OptionalOfDiscriminatingUnion<F extends DiscriminatingUnionTypeDef> = {
  readonly type: TypeDefType.DiscriminatingUnion,
  readonly discriminator: F['discriminator'],
  readonly unions: {
    [K in keyof F['unions']]: OptionalOfRecordFields<F['unions'][K]>;
  },
};

export function optionalOf<T extends TypeDef>(t: T): OptionalOf<T> {
  switch (t.type) {
    case TypeDefType.Literal:
      // converting the implicit any's back causes problems
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return optionalOfLiteral(t) as OptionalOf<T>;
    case TypeDefType.List:
      // converting the implicit any's back causes problems
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return optionalOfList(t) as OptionalOf<T>;
    case TypeDefType.Record:
      // converting the implicit any's back causes problems
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return optionalOfRecord(t) as OptionalOf<T>;
    case TypeDefType.DiscriminatingUnion:
      // converting the implicit any's back causes problems
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return optionalOfDiscriminatingUnion(t) as OptionalOf<T>;
    default:
      throw new UnreachableError(t);
  }
}

function optionalOfLiteral<T extends LiteralTypeDef>(_t: T): OptionalOfLiteral<T> {
  return {
    type: TypeDefType.Literal,
    value: undefined,
  };
}

function optionalOfList<E extends TypeDef, T extends ListTypeDef<E>>({
  elements,
  readonly,
}: T): OptionalOfList<T> {
  return {
    type: TypeDefType.List,
    elements: optionalOf(elements),
    readonly,
  };
}

function optionalOfRecord<F extends RecordTypeDefFields, T extends RecordTypeDef<F>>({
  fields,
}: T): OptionalOfRecord<T> {
  return {
    type: TypeDefType.Record,
    fields: optionalOfRecordFields(fields),
  };
}

function optionalOfRecordFields<T extends RecordTypeDefFields>(fields: T): OptionalOfRecordFields<T> {
  // map implementation doesn't understand record structure and mapping function
  // TODO can we make it understand somehow?
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return map(fields, function (_, field) {
    return optionalOfRecordField(field);
  }) as OptionalOfRecordFields<T>;
}

function optionalOfRecordField<
  V extends TypeDef,
  Readonly extends boolean,
  Optional extends boolean,
  T extends RecordTypeDefField<V, Readonly, Optional>,
>({
  readonly,
  valueType,
}: T): OptionalOfRecordField<T> {
  return {
    valueType: optionalOf(valueType),
    readonly,
    optional: true,
  };
}

function optionalOfDiscriminatingUnion<T extends DiscriminatingUnionTypeDef>({
  discriminator,
  unions,
}: T): OptionalOfDiscriminatingUnion<T> {
  // map implementation doesn't understand record structure and mapping function
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {
    type: TypeDefType.DiscriminatingUnion,
    discriminator,
    unions: map(unions, function (_, union) {
      return optionalOfRecordFields(union);
    }),
  } as OptionalOfDiscriminatingUnion<T>;
}
