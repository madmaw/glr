import { type ReadonlyRecord } from 'base/record';
import {
  type ListTypeDef,
  type LiteralTypeDef,
  type RecordKey,
  type RecordTypeDef,
  type RecordTypeDefField,
  type TypeDef,
  TypeDefType,
} from './definition';
import { type ReadonlyOf } from './readonly_of';
import { type TypeOf } from './type_of';

export function literal<T>(): LiteralTypeDefBuilder<T> {
  return new LiteralTypeDefBuilder({
    type: TypeDefType.Literal,
    value: undefined!,
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
    fields: {},
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

class RecordTypeDefBuilder<
  Fields extends ReadonlyRecord<RecordKey, RecordTypeDefField> = {},
> extends TypeDefBuilder<
  RecordTypeDef<Fields>
> {
  add<
    Name extends string,
    T extends TypeDef,
    Readonly extends boolean,
    Optional extends boolean,
  >(
    name: Name,
    {
      typeDef,
      isOptional,
      isReadonly,
    }: RecordFieldDefBuilder<T, Readonly, Optional>,
  ): RecordTypeDefBuilder<
    Fields & ReadonlyRecord<Name, RecordTypeDefField<T, Readonly, Optional>>
  > {
    return new RecordTypeDefBuilder({
      type: TypeDefType.Record,
      fields: {
        ...this.typeDef.fields,
        [name]: {
          valueType: typeDef,
          optional: isOptional,
          readonly: isReadonly,
        },
      },
    });
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
