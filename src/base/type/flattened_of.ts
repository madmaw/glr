import {
  type DiscriminatedUnionTypeDef,
  type ListTypeDef,
  type LiteralTypeDef,
  type RecordKey,
  type RecordTypeDef,
  type RecordTypeDefFields,
  type TypeDef,
  TypeDefType,
} from './definition';

export type FlattenedOf<F extends TypeDef, Prefix extends string = ''> = F extends LiteralTypeDef
  ? FlattenedOfLiteral<F, Prefix>
  : F extends ListTypeDef ? FlattenedOfList<F, Prefix>
  : F extends RecordTypeDef ? FlattenedOfRecord<F, Prefix>
  : F extends DiscriminatedUnionTypeDef ? FlattenedOfDiscriminatedUnion<F, Prefix>
  : never;

type PrefixOf<
  Prefix extends string,
  Key extends RecordKey | symbol,
> = Key extends RecordKey ? Prefix extends '' ? `${Key}`
  : `${Prefix}.${Key}`
  : never;

type FlattenedOfLiteral<
  F extends LiteralTypeDef,
  Prefix extends string,
> = Readonly<Record<Prefix, F>>;

type FlattenedOfList<
  F extends ListTypeDef,
  Prefix extends string,
  Index extends number = number,
> = F extends ListTypeDef<infer E> ?
    & FlattenedOf<E, PrefixOf<Prefix, Index>>
    & Readonly<Record<Prefix, F>>
  : never;

type FlattenedOfRecordFieldGroup<
  Fields extends Record<string, TypeDef>,
  Prefix extends string,
> = {} extends Fields ? {}
  : {
    readonly [K in keyof Fields]: FlattenedOf<
      Fields[K],
      PrefixOf<Prefix, K>
    >;
  }[keyof Fields];

type FlattenedOfRecord<
  F extends RecordTypeDefFields,
  Prefix extends string,
> = F extends RecordTypeDefFields<
  infer MutableFields,
  infer MutableOptionalFields,
  infer ReadonlyFields,
  infer ReadonlyOptionalFields
> ?
    & FlattenedOfRecordFieldGroup<MutableFields, Prefix>
    & FlattenedOfRecordFieldGroup<MutableOptionalFields, Prefix>
    & FlattenedOfRecordFieldGroup<ReadonlyFields, Prefix>
    & FlattenedOfRecordFieldGroup<ReadonlyOptionalFields, Prefix>
    // include self
    & Readonly<Record<Prefix, F>>
  : never;

type FlattenedOfDiscriminatedUnion<
  F extends DiscriminatedUnionTypeDef,
  Prefix extends string,
> = F extends DiscriminatedUnionTypeDef<infer D, infer U>
  // combine all the possible unions (we don't/can't discriminate on the paths)
  ?
    & {
      readonly [K in keyof U]: FlattenedOfRecord<
        U[K],
        PrefixOf<Prefix, K>
      >;
    }[keyof U]
    // include the discriminator
    & {
      readonly [K in PrefixOf<Prefix, D>]: LiteralTypeDef<D>;
    }
    // include self
    & Readonly<Record<Prefix, F>>
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
  mutableFields: {
    m: n,
  },
  mutableOptionalFields: {
    m: n,
  },
  readonlyFields: {
    m: n,
  },
  readonlyOptionalFields: {},
} as const;

const d = {
  type: TypeDefType.DiscriminatedUnion,
  discriminator: 'x',
  options: {
    a: r2,
  },
} as const;

const ni: FlattenedOf<typeof n, 'ni'> = {
  ni: n,
};

const ai: FlattenedOf<typeof a, 'ai'> = {
  ai: a,
};

const ri: FlattenedOf<typeof r, 'ri'>['ri.om'] = a;
const rp: keyof FlattenedOf<typeof r, 'rp'> = 'rp.m';

const dr2: FlattenedOfRecord<typeof r2, 'r2'> = {
  r2: r2,
  'r2.m': n,
};

const di: FlattenedOf<typeof d, 'di'>['di.a'] = r2;
const dp: keyof FlattenedOf<typeof d, 'di'> = 'di.a.m';
