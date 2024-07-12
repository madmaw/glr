import {
  type DiscriminatingUnionTypeDef,
  type ListTypeDef,
  type LiteralTypeDef,
  type MapTypeDef,
  type NullableTypeDef,
  type StructuredTypeDef,
  type StructuredTypeField,
  TypeDefType,
} from 'base/type/definition';

export const literalNumericTypeDef: LiteralTypeDef<number> = {
  type: TypeDefType.Literal,
  valuePrototype: undefined!,
};

export const literalComplexTypeDef: LiteralTypeDef<{ a: string }> = {
  type: TypeDefType.Literal,
  valuePrototype: undefined!,
};

export const listTypeDef: ListTypeDef<typeof literalNumericTypeDef> = {
  type: TypeDefType.List,
  elements: literalNumericTypeDef,
  readonly: false,
};

export const structuredTypeDef: StructuredTypeDef<{
  literal: StructuredTypeField<typeof literalNumericTypeDef, false, true>,
  list: StructuredTypeField<typeof listTypeDef, false, true>,
}> = {
  type: TypeDefType.Structured,
  fields: {
    literal: {
      valueType: literalNumericTypeDef,
      readonly: false,
      optional: true,
    },
    list: {
      valueType: listTypeDef,
      readonly: false,
      optional: true,
    },
  },
};

export const structuredCoordinateTypeDef: StructuredTypeDef<{
  x: StructuredTypeField<typeof literalNumericTypeDef, true, false>,
  y: StructuredTypeField<typeof literalNumericTypeDef, true, false>,
}> = {
  type: TypeDefType.Structured,
  fields: {
    x: {
      valueType: literalNumericTypeDef,
      readonly: true,
      optional: false,
    },
    y: {
      valueType: literalNumericTypeDef,
      readonly: true,
      optional: false,
    },
  },
};

export const mapTypeDef: MapTypeDef<'a' | 'b', typeof structuredCoordinateTypeDef, false, false> = {
  type: TypeDefType.Map,
  keyPrototype: undefined!,
  readonly: false,
  partial: false,
  valueType: structuredCoordinateTypeDef,
};

export const discriminatingUnionTypeDef: DiscriminatingUnionTypeDef<'disc', {
  a: typeof structuredTypeDef.fields,
  b: typeof structuredCoordinateTypeDef.fields,
}> = {
  type: TypeDefType.DiscriminatingUnion,
  discriminator: 'disc',
  unions: {
    a: structuredTypeDef.fields,
    b: structuredCoordinateTypeDef.fields,
  },
};

export const discriminatingUnionDiscriminatorTypeDef: LiteralTypeDef<'a' | 'b'> = {
  type: TypeDefType.Literal,
  valuePrototype: undefined!,
};

export const nullableStructuredCoordinateTypeDef: NullableTypeDef<typeof structuredCoordinateTypeDef> = {
  type: TypeDefType.Nullable,
  nonNullableTypeDef: structuredCoordinateTypeDef,
};

export const listOfNullableCoordinatesTypeDef: ListTypeDef<typeof nullableStructuredCoordinateTypeDef> = {
  type: TypeDefType.List,
  elements: nullableStructuredCoordinateTypeDef,
  readonly: false,
};
