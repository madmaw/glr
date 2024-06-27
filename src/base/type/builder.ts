import { type ReadonlyRecord } from 'base/record';
import {
  type ListTypeDef,
  type LiteralTypeDef,
  type RecordKey,
  type RecordTypeDef,
  type TypeDef,
  TypeDefType,
} from './definition';
import { type ReadonlyOf } from './readonly_of';
import { type TypeOf } from './type_of';

export function literal<T>(): LiteralTypeDefBuilder<T> {
  return new LiteralTypeDefBuilder({
    type: TypeDefType.Literal,
  });
}

export const stringBuilder = literal<string>();
export const numberBuilder = literal<number>();
export const booleanBuilder = literal<boolean>();

export function list<T extends TypeDef>(elements: TypeDefBuilder<T>): ListTypeDefBuilder<T, false> {
  return new ListTypeDefBuilder({
    type: TypeDefType.List,
    elements: elements.typeDef,
    readonly: false,
  });
}

export function record(): RecordTypeDefBuilder {
  return new RecordTypeDefBuilder({
    type: TypeDefType.Record,
    mutableFields: {},
    mutableOptionalFields: {},
    readonlyFields: {},
    readonlyOptionalFields: {},
  });
}

export function field<T extends TypeDef>(builder: TypeDefBuilder<T>): RecordFieldDefBuilder<T> {
  return new RecordFieldDefBuilder(builder.typeDef, false, false);
}

class TypeDefBuilder<T extends TypeDef> {
  readonly aInstance!: TypeOf<T>;

  readonly aReadonly!: TypeOf<ReadonlyOf<T>>;

  // TODO: other types (e.g. exploded, flattened, etc)?

  constructor(readonly typeDef: T) {
  }
}

class LiteralTypeDefBuilder<T> extends TypeDefBuilder<LiteralTypeDef<T>> {
}

class ListTypeDefBuilder<
  T extends TypeDef,
  Readonly extends boolean,
> extends TypeDefBuilder<ListTypeDef<T, Readonly>> {
  constructor(typeDef: ListTypeDef<T, Readonly>) {
    super(typeDef);
  }

  readonly() {
    return new ListTypeDefBuilder<T, true>({
      ...this.typeDef,
      readonly: true,
    });
  }
}

function maybeAddToFields<
  Fields extends ReadonlyRecord<RecordKey, TypeDef>,
  Name extends string,
  Field extends TypeDef,
  Add extends boolean,
>(
  fields: Fields,
  name: Name,
  field: Field,
  add: Add,
): Add extends true ? Fields & ReadonlyRecord<Name, Field> : Fields {
  return add
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    ? {
      ...fields,
      [name]: field,
      // doesn't recognize this as being the reported type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
    : fields;
}

class RecordTypeDefBuilder<
  MutableFields extends ReadonlyRecord<RecordKey, TypeDef> = {},
  MutableOptionalFields extends ReadonlyRecord<RecordKey, TypeDef> = {},
  ReadonlyFields extends ReadonlyRecord<RecordKey, TypeDef> = {},
  ReadonlyOptionalFields extends ReadonlyRecord<RecordKey, TypeDef> = {},
> extends TypeDefBuilder<
  RecordTypeDef<
    MutableFields,
    MutableOptionalFields,
    ReadonlyFields,
    ReadonlyOptionalFields
  >
> {
  add<
    Name extends string,
    T extends TypeDef,
    Readonly extends boolean,
    Optional extends boolean,
  >(
    name: Name,
    field: RecordFieldDefBuilder<T, Readonly, Optional>,
  ): Readonly extends true ? Optional extends true ? RecordTypeDefBuilder<
        MutableFields,
        MutableOptionalFields,
        ReadonlyFields,
        ReadonlyOptionalFields & Record<Name, T>
      >
    : RecordTypeDefBuilder<
      MutableFields,
      MutableOptionalFields,
      ReadonlyFields & Record<Name, T>,
      ReadonlyOptionalFields
    >
    : Optional extends true ? RecordTypeDefBuilder<
        MutableFields,
        MutableOptionalFields & Record<Name, T>,
        ReadonlyFields,
        ReadonlyOptionalFields
      >
    : RecordTypeDefBuilder<
      MutableFields & Record<Name, T>,
      MutableOptionalFields,
      ReadonlyFields,
      ReadonlyOptionalFields
    >
  {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return new RecordTypeDefBuilder({
      type: TypeDefType.Record,
      mutableFields: maybeAddToFields(
        this.typeDef.mutableFields,
        name,
        field.typeDef,
        !field.isReadonly && !field.isOptional,
      ),
      mutableOptionalFields: maybeAddToFields(
        this.typeDef.mutableOptionalFields,
        name,
        field.typeDef,
        !field.isReadonly && field.isOptional,
      ),
      readonlyFields: maybeAddToFields(
        this.typeDef.readonlyFields,
        name,
        field.typeDef,
        field.isReadonly && !field.isOptional,
      ),
      readonlyOptionalFields: maybeAddToFields(
        this.typeDef.readonlyOptionalFields,
        name,
        field.typeDef,
        field.isReadonly && field.isOptional,
      ),
      // doesn't recognize this as being the reported type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;
  }
}

class RecordFieldDefBuilder<
  T extends TypeDef,
  Readonly extends boolean = false,
  Optional extends boolean = false,
> {
  constructor(
    readonly typeDef: TypeDef,
    readonly isReadonly: Readonly,
    readonly isOptional: Optional,
  ) {
  }

  readonly() {
    return new RecordFieldDefBuilder<T, true, Optional>(this.typeDef, true, this.isOptional);
  }

  optional() {
    return new RecordFieldDefBuilder<T, Readonly, true>(this.typeDef, this.isReadonly, true);
  }
}
