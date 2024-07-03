import {
  type DiscriminatingUnionTypeDef,
  type ListTypeDef,
  type LiteralTypeDef,
  type RecordTypeDef,
  type RecordTypeDefField,
  TypeDefType,
} from 'base/type/definition';

export const literalNumericTypeDef: LiteralTypeDef<number> = {
  type: TypeDefType.Literal,
  value: undefined!,
};

export const literalComplexTypeDef: LiteralTypeDef<{ a: string }> = {
  type: TypeDefType.Literal,
  value: undefined!,
};

export const listTypeDef: ListTypeDef<typeof literalNumericTypeDef> = {
  type: TypeDefType.List,
  elements: literalNumericTypeDef,
  readonly: false,
};

export const recordTypeDef: RecordTypeDef<{
  literal: RecordTypeDefField<typeof literalNumericTypeDef, false, false>,
  list: RecordTypeDefField<typeof listTypeDef, false, false>,
}> = {
  type: TypeDefType.Record,
  fields: {
    literal: {
      valueType: literalNumericTypeDef,
      readonly: false,
      optional: false,
    },
    list: {
      valueType: listTypeDef,
      readonly: false,
      optional: false,
    },
  },
};

export const recordCoordinateTypeDef: RecordTypeDef<{
  x: RecordTypeDefField<typeof literalNumericTypeDef, true, false>,
  y: RecordTypeDefField<typeof literalNumericTypeDef, true, false>,
}> = {
  type: TypeDefType.Record,
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

export const discriminatingUnionTypeDef: DiscriminatingUnionTypeDef<'disc', {
  a: typeof recordTypeDef.fields,
  b: typeof recordCoordinateTypeDef.fields,
}> = {
  type: TypeDefType.DiscriminatingUnion,
  discriminator: 'disc',
  unions: {
    a: recordTypeDef.fields,
    b: recordCoordinateTypeDef.fields,
  },
};

export const discriminatingUnionDiscriminatorTypeDef: LiteralTypeDef<'a' | 'b'> = {
  type: TypeDefType.Literal,
  value: undefined!,
};
