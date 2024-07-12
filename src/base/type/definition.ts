import { type ReadonlyRecord } from 'base/record';

export const enum TypeDefType {
  Literal = 1,
  Nullable,
  List,
  Map,
  Structured,
  DiscriminatingUnion,
}

export type TypeDef =
  | LiteralTypeDef
  | NullableTypeDef
  | ListTypeDef
  | MapTypeDef
  | StructuredTypeDef
  | DiscriminatingUnionTypeDef;

// literal

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LiteralTypeDef<V = any> = {
  readonly type: TypeDefType.Literal,
  // never actually populate
  readonly valuePrototype: V,
};

// nullable

export type NullableTypeDef<
  // avoid circular ref by defaulting to `any`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends TypeDef = any,
> = {
  readonly type: TypeDefType.Nullable,
  readonly nonNullableTypeDef: T,
};

// list

// avoid circular ref by defaulting to `any`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ListTypeDef<E extends TypeDef = any, Readonly extends boolean = boolean> = {
  readonly type: TypeDefType.List,
  readonly elements: E,
  readonly readonly: Readonly,
};

// map

export type MapKeyType = string | number;

export type MapTypeDef<
  K extends MapKeyType = MapKeyType,
  // avoid circular ref by defaulting to `any`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  V extends TypeDef = any,
  Readonly extends boolean = boolean,
  Partial extends boolean = boolean,
> = {
  readonly type: TypeDefType.Map,
  // never actually populate
  readonly keyPrototype: K,
  readonly valueType: V,
  readonly readonly: Readonly,
  readonly partial: Partial,
};

// structured type

export type StructuredFieldKey = string | number;

export type StructuredTypeField<
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

export type StructuredTypeDefFields = ReadonlyRecord<StructuredFieldKey, StructuredTypeField>;

export type StructuredTypeDef<
  Fields extends StructuredTypeDefFields = StructuredTypeDefFields,
> = {
  readonly type: TypeDefType.Structured,
  readonly fields: Fields,
};

// discriminating union

export type DiscriminatingUnionKey = string | number;

export type DiscriminatingUnionTypeDef<
  D extends string = string,
  U extends ReadonlyRecord<
    DiscriminatingUnionKey,
    StructuredTypeDefFields
  > = ReadonlyRecord<DiscriminatingUnionKey, StructuredTypeDefFields>,
> = {
  readonly type: TypeDefType.DiscriminatingUnion,
  readonly discriminator: D,
  readonly unions: U,
};
