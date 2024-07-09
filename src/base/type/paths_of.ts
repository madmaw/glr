import {
  type DiscriminatingUnionTypeDef,
  type ListTypeDef,
  type LiteralTypeDef,
  type NullableTypeDef,
  type RecordKey,
  type RecordTypeDef,
  type RecordTypeDefField,
  type RecordTypeDefFields,
  type TypeDef,
} from './definition';

type DefaultDepth = 21;

// causes typescript to infinitely recurse, so have to redo the calculations long-hand
// export type PathsOf<
//   F extends TypeDef,
//   Prefix extends string = '',
//   Override extends string | undefined = undefined,
// > = keyof FlattenedOf<F, Prefix, Override>;

export type PathsOf<
  F extends TypeDef,
  Prefix extends string = '',
  VariableSegmentOverride extends string | undefined = undefined,
> = InternalPathsOf<F, Prefix, VariableSegmentOverride, DefaultDepth>;

type InternalPathsOf<
  F extends TypeDef,
  Prefix extends string,
  VariableSegmentOverride extends string | undefined,
  Depth extends number,
  NextDepth extends number = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20][Depth],
> = NextDepth extends -1 ? never
  :
    | InternalPathsOfChildren<F, Prefix, VariableSegmentOverride, NextDepth>
    | Prefix;

type InternalPathsOfChildren<
  F extends TypeDef,
  Prefix extends string,
  VariableSegmentOverride extends string | undefined,
  Depth extends number,
> = F extends LiteralTypeDef ? PathsOfLiteralChildren
  : F extends NullableTypeDef ? PathsOfNullableChildren<F, Prefix, VariableSegmentOverride, Depth>
  : F extends ListTypeDef ? PathsOfListChildren<F, Prefix, VariableSegmentOverride, Depth>
  : F extends RecordTypeDef ? FlattenedOfRecordChildren<F, Prefix, VariableSegmentOverride, Depth>
  : F extends DiscriminatingUnionTypeDef
    ? FlattenedOfDiscriminatingUnionChildren<F, Prefix, VariableSegmentOverride, Depth>
  : never;

type PrefixOf<
  Prefix extends string,
  Key extends RecordKey | symbol,
> = Key extends RecordKey ? Prefix extends '' ? `${Key}`
  : `${Prefix}.${Key}`
  : never;

type PathsOfLiteralChildren = never;

type PathsOfNullableChildren<
  F extends NullableTypeDef,
  Prefix extends string,
  VariableSegmentOverride extends string | undefined,
  Depth extends number,
> = InternalPathsOfChildren<F['nonNullableTypeDef'], Prefix, VariableSegmentOverride, Depth>;

type PathsOfListChildren<
  F extends ListTypeDef,
  Prefix extends string,
  VariableSegmentOverride extends string | undefined,
  Depth extends number,
> = InternalPathsOf<
  F['elements'],
  PrefixOf<
    Prefix,
    VariableSegmentOverride extends undefined ? number : VariableSegmentOverride
  >,
  VariableSegmentOverride,
  Depth
>;

type PathsOfRecordFieldGroup<
  Fields extends Record<string, RecordTypeDefField>,
  Prefix extends string,
  VariableSegmentOverride extends string | undefined,
  Depth extends number,
> = {
  readonly [K in keyof Fields]: InternalPathsOf<
    Fields[K]['valueType'],
    PrefixOf<Prefix, K>,
    VariableSegmentOverride,
    Depth
  >;
}[keyof Fields];

type PathsOfRecordFields<
  F extends RecordTypeDefFields,
  Prefix extends string,
  VariableSegmentOverride extends string | undefined,
  Depth extends number,
> = PathsOfRecordFieldGroup<F, Prefix, VariableSegmentOverride, Depth>;

type FlattenedOfRecordChildren<
  F extends RecordTypeDef,
  Prefix extends string,
  VariableSegmentOverride extends string | undefined,
  Depth extends number,
> = PathsOfRecordFields<
  F['fields'],
  Prefix,
  VariableSegmentOverride,
  Depth
>;

type FlattenedOfDiscriminatingUnionChildren<
  F extends DiscriminatingUnionTypeDef,
  Prefix extends string,
  VariableSegmentOverride extends string | undefined,
  Depth extends number,
> =
  | {
    readonly [K in keyof F['unions']]:
      | PathsOfRecordFields<
        F['unions'][K],
        PrefixOf<Prefix, K>,
        VariableSegmentOverride,
        Depth
      >
      // synthesize a type for PrefixOf<Prefix, K>
      | PrefixOf<Prefix, K>;
  }[keyof F['unions']]
  // include the discriminator
  | PrefixOf<Prefix, F['discriminator']>;
