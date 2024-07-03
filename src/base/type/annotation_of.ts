import {
  type DiscriminatingUnionTypeDef,
  type ListTypeDef,
  type LiteralTypeDef,
  type RecordTypeDef,
  type RecordTypeDefFields,
  type TypeDef,
  type TypeDefType,
} from './definition';

// Mot sure this is really a good idea. The primary use case of error annotations
// can be done more neatly by flattening the original typedef and just assigning
// errors into the keys of the various fields
export type AnnotationOf<
  F extends TypeDef,
  A extends LiteralTypeDef,
> = {
  type: TypeDefType.Record,
  fields: {
    annotation: {
      valueType: A,
      readonly: false,
      optional: true,
    },
    value: {
      valueType: AnnotationOfAnnotated<F, A>,
      readonly: true,
      optional: false,
    },
  },
};

type AnnotationOfAnnotated<
  F extends TypeDef,
  A extends LiteralTypeDef,
> = F extends LiteralTypeDef ? AnnotationOfLiteral<F>
  : F extends ListTypeDef ? AnnotationOfList<F, A>
  : F extends RecordTypeDef ? AnnotationOfRecord<F, A>
  : F extends DiscriminatingUnionTypeDef ? AnnotationOfDiscriminatingUnion<F, A>
  : never;

type AnnotationOfLiteral<
  F extends LiteralTypeDef,
> = F;

type AnnotationOfList<
  F extends ListTypeDef,
  A extends LiteralTypeDef,
> = {
  type: TypeDefType.List,
  readonly: F['readonly'],
  elements: AnnotationOf<F['elements'], A>,
};

type AnnotationOfRecord<
  F extends RecordTypeDef,
  A extends LiteralTypeDef,
> = {
  type: TypeDefType.Record,
  fields: AnnotationOfRecordFields<F['fields'], A>,
};

type AnnotationOfRecordFields<
  F extends RecordTypeDefFields,
  A extends LiteralTypeDef,
> = {
  readonly [K in keyof F]: {
    valueType: AnnotationOf<F[K]['valueType'], A>,
    readonly: F[K]['readonly'],
    optional: F[K]['optional'],
  };
};

type AnnotationOfDiscriminatingUnion<
  F extends DiscriminatingUnionTypeDef,
  A extends LiteralTypeDef,
> = {
  type: TypeDefType.DiscriminatingUnion,
  unions: {
    readonly [K in keyof F['unions']]: AnnotationOfRecordFields<F['unions'][K], A>;
  },
  discriminator: F['discriminator'],
};
