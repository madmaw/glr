import { type UnionToIntersection } from 'base/lang';
import { type ReadonlyRecord } from 'base/record';
import {
  type DiscriminatingUnionTypeDef,
  type ListTypeDef,
  type LiteralTypeDef,
  type RecordKey,
  type RecordTypeDef,
  type RecordTypeDefField,
  type RecordTypeDefFields,
  type TypeDef,
  TypeDefType,
} from './definition';

export type FlattenedOf<F extends TypeDef, Prefix extends string = ''> = F extends LiteralTypeDef
  ? FlattenedOfLiteral<F, Prefix>
  : F extends ListTypeDef ? FlattenedOfList<F, Prefix>
  : F extends RecordTypeDef ? FlattenedOfRecord<F, Prefix>
  : F extends DiscriminatingUnionTypeDef ? FlattenedOfDiscriminatingUnion<F, Prefix>
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
> = ReadonlyRecord<Prefix, F>;

type FlattenedOfList<
  F extends ListTypeDef,
  Prefix extends string,
  Index extends number = number,
> = F extends ListTypeDef<infer E> ?
    & FlattenedOf<E, PrefixOf<Prefix, Index>>
    & ReadonlyRecord<Prefix, F>
  : never;

type FlattenedOfRecordFieldGroup<
  Fields extends Record<string, RecordTypeDefField>,
  Prefix extends string,
> = {} extends Fields ? {}
  : UnionToIntersection<{
    readonly [K in keyof Fields]: FlattenedOf<
      Fields[K]['valueType'],
      PrefixOf<Prefix, K>
    >;
  }[keyof Fields]>;

type FlattenedOfRecord<
  F extends RecordTypeDefFields,
  Prefix extends string,
> = F extends RecordTypeDefFields<infer Fields> ?
    & FlattenedOfRecordFieldGroup<Fields, Prefix>
    // include self
    & ReadonlyRecord<Prefix, F>
  : never;

type FlattenedOfDiscriminatingUnion<
  F extends DiscriminatingUnionTypeDef,
  Prefix extends string,
> = F extends DiscriminatingUnionTypeDef<infer D, infer U>
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
      readonly [K in PrefixOf<Prefix, D>]: LiteralTypeDef<keyof U>;
    }
    // include self
    & ReadonlyRecord<Prefix, F>
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
    a: r2,
  },
} as const;

const ni: FlattenedOf<typeof n, 'ni'> = {
  ni: n,
};

const ai: FlattenedOf<typeof a, 'ai'> = {
  ai: a,
  'ai.0': n,
  'ai.1': n,
  // 'ax': n,
};
const ap: (keyof FlattenedOf<typeof a, 'ai'>)[] = [
  'ai',
  'ai.0',
];

const ri: FlattenedOf<typeof r, 'ri'>['ri.om'] = a;
const rp: (keyof FlattenedOf<typeof r, 'rp'>)[] = [
  'rp.m',
  'rp.om',
  'rp.om.0',
];

const ri2: FlattenedOfRecord<typeof r2, 'r2'> = {
  r2: r2,
  'r2.r': n,
};

const di: FlattenedOf<typeof d, 'di'>['di.x'] = {
  type: TypeDefType.Literal,
  value: 'a',
};
const dp: (keyof FlattenedOf<typeof d, 'di'>)[] = [
  'di.a.r',
  'di.x',
];
