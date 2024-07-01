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

export type TypeOf<F extends TypeDef, Extra = {}> = F extends LiteralTypeDef ? TypeOfLiteral<F>
  : F extends ListTypeDef ? TypeOfList<F, Extra>
  : F extends RecordTypeDef ? TypeOfRecord<F, Extra>
  : F extends DiscriminatingUnionTypeDef ? TypeOfDiscriminatingUnion<F, Extra>
  : never;

type TypeOfLiteral<F extends LiteralTypeDef> = F['value'];

export type TypeOfList<F extends ListTypeDef, Extra> = (F['readonly'] extends true ? readonly TypeOf<F['elements']>[]
  : TypeOf<F['elements']>[]) & (Extra);

type MutableValueTypesOfFields<F extends RecordTypeDefFields> = {
  readonly [K in keyof F as F[K] extends RecordTypeDefField<TypeDef, false, false> ? K : never]: F[K]['valueType'];
};

type MutableOptionalValueTypesOfFields<F extends RecordTypeDefFields> = {
  readonly [K in keyof F as F[K] extends RecordTypeDefField<TypeDef, false, true> ? K : never]: F[K]['valueType'];
};

type ReadonlyValueTypesOfFields<F extends RecordTypeDefFields> = {
  readonly [K in keyof F as F[K] extends RecordTypeDefField<TypeDef, true, false> ? K : never]: F[K]['valueType'];
};

type ReadonlyOptionalValueTypesOfFields<F extends RecordTypeDefFields> = {
  readonly [K in keyof F as F[K] extends RecordTypeDefField<TypeDef, true, true> ? K : never]: F[K]['valueType'];
};

export type TypeOfRecord<
  F extends RecordTypeDef,
  Extra,
> = TypeOfRecordFields<F['fields'], Extra>;

export type TypeOfRecordFields<
  F extends RecordTypeDefFields,
  Extra,
> = F extends RecordTypeDefFields ?
    & {
      -readonly [K in keyof MutableValueTypesOfFields<F>]-?: TypeOf<
        MutableValueTypesOfFields<F>[K],
        Extra
      >;
    }
    & {
      -readonly [K in keyof MutableOptionalValueTypesOfFields<F>]?: TypeOf<
        MutableOptionalValueTypesOfFields<F>[K],
        Extra
      >;
    }
    & {
      readonly [K in keyof ReadonlyValueTypesOfFields<F>]-?: TypeOf<
        ReadonlyValueTypesOfFields<F>[K],
        Extra
      >;
    }
    & {
      readonly [K in keyof ReadonlyOptionalValueTypesOfFields<F>]?: TypeOf<
        ReadonlyOptionalValueTypesOfFields<F>[K],
        Extra
      >;
    }
    & Extra
  : never;

export type TypeOfDiscriminatingUnion<
  F extends DiscriminatingUnionTypeDef,
  Extra,
> = F extends DiscriminatingUnionTypeDef<infer D, infer U> ? {
    [K in keyof U]: TypeOfRecordFields<U[K], Extra> & {
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
  fields: {
    m: {
      valueType: n,
      readonly: false,
      optional: false,
    },
    om: {
      valueType: a,
      readonly: false,
      optional: true,
    },
    r: {
      valueType: n,
      readonly: true,
      optional: false,
    },
    or: {
      valueType: n,
      readonly: true,
      optional: true,
    },
  },
} as const;

const r2 = {
  type: TypeDefType.Record,
  fields: {
    r: {
      valueType: n,
      readonly: false,
      optional: false,
    },
  },
} as const;

const d = {
  type: TypeDefType.DiscriminatingUnion,
  discriminator: 'x',
  unions: {
    [1]: r.fields,
    [2]: r2.fields,
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
