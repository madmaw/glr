import { type ReadonlyRecord } from 'base/record';

export const enum TypeDefType {
  Literal = 1,
  List,
  Record,
  DiscriminatingUnion,
}

export type TypeDef =
  | LiteralTypeDef
  | ListTypeDef
  | RecordTypeDef
  | DiscriminatingUnionTypeDef;

// literal

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LiteralTypeDef<V = any> = {
  readonly type: TypeDefType.Literal,
  // never actually populate
  readonly value: V,
};

// list

// avoid circular ref by defaulting to `any`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ListTypeDef<E extends TypeDef = any, Readonly extends boolean = boolean> = {
  readonly type: TypeDefType.List,
  readonly elements: E,
  readonly readonly: Readonly,
};

// record
// TODO rename to `struct` and have `record` being just a map of arbitrary keys to a single value type

export type RecordKey = string | number;

export type RecordTypeDefField<
  // avoid circular ref by defaulting to `any`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  V extends TypeDef = any,
  Readonly extends boolean = boolean,
  Optional extends boolean = boolean,
> = {
  readonly valueType: V,
  readonly readonly: Readonly,
  readonly optional: Optional,
};

export type RecordTypeDefFields = ReadonlyRecord<RecordKey, RecordTypeDefField>;

export type RecordTypeDef<
  Fields extends RecordTypeDefFields = RecordTypeDefFields,
> = {
  readonly type: TypeDefType.Record,
  readonly fields: Fields,
};

// discriminating union

export type DiscriminatingUnionTypeDef<
  D extends string = string,
  U extends ReadonlyRecord<RecordKey, RecordTypeDefFields> = ReadonlyRecord<RecordKey, RecordTypeDefFields>,
> = {
  readonly type: TypeDefType.DiscriminatingUnion,
  readonly discriminator: D,
  readonly unions: U,
};
