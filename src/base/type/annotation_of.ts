import {
  type DiscriminatedUnionTypeDef,
  type ListTypeDef,
  type LiteralTypeDef,
  type RecordTypeDef,
  type RecordTypeDefFields,
  type TypeDef,
} from './definition';

// TODO needs consideration on what fields should be optional here

export type AnnotationOf<F extends TypeDef, A> = F extends LiteralTypeDef ? AnnotationsOfLiteral<F, A>
  : F extends ListTypeDef ? AnnotationsOfList<F, A>
  : F extends RecordTypeDef ? AnnotationOfRecord<F, A>
  : F extends DiscriminatedUnionTypeDef ? AnnotationOfDiscriminatedUnion<F, A>
  : never;

type AnnotationsOfLiteral<F extends LiteralTypeDef, A> = F extends LiteralTypeDef ? A : never;

type AnnotationsOfList<
  F extends ListTypeDef,
  A,
> = F extends ListTypeDef<infer E> ? {
    readonly children: AnnotationOf<E, A>[],
    readonly annotation: A,
  }
  : never;

type AnnotationOfRecord<
  F extends RecordTypeDefFields,
  A,
> = F extends RecordTypeDefFields<
  infer MutableFields,
  infer MutableOptionalFields,
  infer ReadonlyFields,
  infer ReadonlyOptionalFields
> ? {
    children: {
      readonly [K in keyof MutableFields]: AnnotationOf<MutableFields[K], A>;
    } & {
      readonly [K in keyof MutableOptionalFields]: AnnotationOf<MutableOptionalFields[K], A>;
    } & {
      readonly [K in keyof ReadonlyFields]: AnnotationOf<ReadonlyFields[K], A>;
    } & {
      readonly [K in keyof ReadonlyOptionalFields]: AnnotationOf<ReadonlyOptionalFields[K], A>;
    },
    annotation: A,
  }
  : never;

type AnnotationOfDiscriminatedUnion<
  F extends DiscriminatedUnionTypeDef,
  A,
> = F extends DiscriminatedUnionTypeDef<
  infer D,
  infer U
> ? {
    readonly [K in keyof U]: AnnotationOfRecord<U[K], A> & {
      readonly [V in D]: K;
    };
  }[keyof U]
  : never;
