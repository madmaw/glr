import {
  type DiscriminatedUnionTypeDef,
  type ListTypeDef,
  type LiteralTypeDef,
  type RecordTypeDef,
  type RecordTypeDefFields,
  type TypeDef,
  TypeDefType,
} from './definition';

export type TypeOf<F extends TypeDef, Extra = {}> = F extends LiteralTypeDef ? TypeOfLiteral<F>
  : F extends ListTypeDef ? TypeOfList<F, Extra>
  : F extends RecordTypeDef ? TypeOfRecord<F, Extra>
  : F extends DiscriminatedUnionTypeDef ? TypeOfDiscriminatedUnion<F, Extra>
  : never;

type TypeOfLiteral<F extends LiteralTypeDef> = F['value'];

export type TypeOfList<F extends ListTypeDef, Extra> = (F['readonly'] extends true ? readonly TypeOf<F['elements']>[]
  : TypeOf<F['elements']>[]) & (Extra);

export type TypeOfRecord<F extends RecordTypeDefFields, Extra> = {
  -readonly [K in keyof F['mutableFields']]-?: TypeOf<F['mutableFields'][K], Extra>;
} & {
  -readonly [K in keyof F['mutableOptionalFields']]?: TypeOf<F['mutableOptionalFields'][K], Extra>;
} & {
  readonly [K in keyof F['readonlyFields']]-?: TypeOf<F['readonlyFields'][K], Extra>;
} & {
  readonly [K in keyof F['readonlyOptionalFields']]?: TypeOf<F['readonlyOptionalFields'][K], Extra>;
} & Extra;

export type TypeOfDiscriminatedUnion<
  F extends DiscriminatedUnionTypeDef,
  Extra,
> = F extends DiscriminatedUnionTypeDef<infer D, infer U> ? {
    [K in keyof U]: TypeOfRecord<U[K], Extra> & {
      [V in D]: K;
    };
  }[keyof U] & Extra
  : never;

const n: LiteralTypeDef<1 | 3 | 5> = {
  type: TypeDefType.Literal,
  value: undefined!,
};

const a: ListTypeDef<typeof n, true> = {
  type: TypeDefType.List,
  elements: n,
  readonly: true,
};

const r = {
  type: TypeDefType.Record,
  mutableFields: {
    m: n,
  },
  mutableOptionalFields: {
    om: a,
  },
  readonlyFields: {
    r: n,
  },
  readonlyOptionalFields: {
    or: n,
  },
} as const;

const r2 = {
  type: TypeDefType.Record,
  mutableFields: {},
  mutableOptionalFields: {},
  readonlyFields: {
    r: n,
  },
  readonlyOptionalFields: {},
} as const;

const d = {
  type: TypeDefType.DiscriminatedUnion,
  discriminator: 'x',
  options: {
    [1]: r,
    [2]: r2,
  },
} as const;

const ni: TypeOf<typeof n> = 1;

const ai: TypeOf<typeof a> = [
  1,
  1,
  1,
  5,
];

const ri: TypeOf<typeof r> = {
  m: 1,
  om: [3],
  r: 1,
  or: 5,
};
ri.m = 3;

const di: TypeOf<typeof d> = {
  x: 2,
  r: 1,
};
