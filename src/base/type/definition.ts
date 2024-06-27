import { type ReadonlyRecord } from 'base/record';

export const enum TypeDefType {
  Literal = 1,
  List,
  Record,
  DiscriminatedUnion,
}

export type TypeDef = LiteralTypeDef | ListTypeDef | RecordTypeDef | DiscriminatedUnionTypeDef;

// literal

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LiteralTypeDef<V = any> = {
  readonly type: TypeDefType.Literal,
  // never actually populate
  readonly value?: V,
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

export type RecordKey = string | number;

export type RecordTypeDefFields<
  // avoid circular ref by defaulting to `any`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  MutableFields extends ReadonlyRecord<RecordKey, TypeDef> = ReadonlyRecord<RecordKey, any>,
  // avoid circular ref by defaulting to `any`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  MutableOptionalFields extends ReadonlyRecord<RecordKey, TypeDef> = ReadonlyRecord<RecordKey, any>,
  // avoid circular ref by defaulting to `any`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ReadonlyFields extends ReadonlyRecord<RecordKey, TypeDef> = ReadonlyRecord<RecordKey, any>,
  // avoid circular ref by defaulting to `any`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ReadonlyOptionalFields extends ReadonlyRecord<RecordKey, TypeDef> = ReadonlyRecord<RecordKey, any>,
> = {
  readonly mutableFields: MutableFields,
  readonly mutableOptionalFields: MutableOptionalFields,
  readonly readonlyFields: ReadonlyFields,
  readonly readonlyOptionalFields: ReadonlyOptionalFields,
};

export type RecordTypeDef<
  // avoid circular ref by defaulting to `any`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  MutableFields extends ReadonlyRecord<RecordKey, TypeDef> = ReadonlyRecord<RecordKey, any>,
  // avoid circular ref by defaulting to `any`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  MutableOptionalFields extends ReadonlyRecord<RecordKey, TypeDef> = ReadonlyRecord<RecordKey, any>,
  // avoid circular ref by defaulting to `any`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ReadonlyFields extends ReadonlyRecord<RecordKey, TypeDef> = ReadonlyRecord<RecordKey, any>,
  // avoid circular ref by defaulting to `any`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ReadonlyOptionalFields extends ReadonlyRecord<RecordKey, TypeDef> = ReadonlyRecord<RecordKey, any>,
> = {
  readonly type: TypeDefType.Record,
} & RecordTypeDefFields<
  MutableFields,
  MutableOptionalFields,
  ReadonlyFields,
  ReadonlyOptionalFields
>;

// discriminated union
// TODO rename to DiscriminatingUnionTypeDef
export type DiscriminatedUnionTypeDef<
  D extends string = string,
  U extends ReadonlyRecord<RecordKey, RecordTypeDefFields> = ReadonlyRecord<RecordKey, RecordTypeDefFields>,
> = {
  readonly type: TypeDefType.DiscriminatedUnion,
  readonly discriminator: D,
  // TODO rename to unions
  readonly options: U,
};
