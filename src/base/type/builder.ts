import { type ReadonlyRecord } from 'base/record';
import {
  type ListTypeDef,
  type LiteralTypeDef,
  type NullableTypeDef,
  type RecordKey,
  type RecordTypeDef,
  type RecordTypeDefField,
  type TypeDef,
  TypeDefType,
} from './definition';
import {
  type PartialOf,
  partialOf,
} from './partial_of';
import {
  type ReadonlyOf,
  readonlyOf,
} from './readonly_of';
import { type ValueTypeOf } from './value_type_of';

export function literal<T>(): LiteralTypeDefBuilder<T> {
  return new LiteralTypeDefBuilder({
    type: TypeDefType.Literal,
    value: undefined!,
  });
}

export const stringBuilder = literal<string>();
export const numberBuilder = literal<number>();
export const booleanBuilder = literal<boolean>();

export function nullable<T extends TypeDef>(nonNullable: TypeDefBuilder<T>): NullableTypeDefBuilder<T> {
  return new NullableTypeDefBuilder({
    type: TypeDefType.Nullable,
    nonNullableTypeDef: nonNullable.typeDef,
  });
}

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
  /**
   * Instance of the type of the built typedef. This value is never populated
   * and should only be used as `typeof x.aInstance`
   */
  readonly aValue!: ValueTypeOf<T>;

  get readonlyOf(): TypeDefBuilder<ReadonlyOf<T>> {
    return new TypeDefBuilder(readonlyOf(this.typeDef));
  }

  get partialOf(): TypeDefBuilder<PartialOf<T>> {
    return new TypeDefBuilder(partialOf(this.typeDef));
  }

  constructor(readonly typeDef: T) {
  }
}

class LiteralTypeDefBuilder<T> extends TypeDefBuilder<LiteralTypeDef<T>> {
}

class NullableTypeDefBuilder<T extends TypeDef> extends TypeDefBuilder<NullableTypeDef<T>> {
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
