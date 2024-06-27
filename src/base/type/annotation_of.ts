import {
  type DiscriminatingUnionTypeDef,
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
  : F extends DiscriminatingUnionTypeDef ? AnnotationOfDiscriminatingUnion<F, A>
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
> = F extends RecordTypeDefFields<infer Fields> ? {
    children: {
      readonly [K in keyof Fields]: AnnotationOf<Fields[K]['valueType'], A>;
    },
    annotation: A,
  }
  : never;

type AnnotationOfDiscriminatingUnion<
  F extends DiscriminatingUnionTypeDef,
  A,
> = F extends DiscriminatingUnionTypeDef<
  infer D,
  infer U
> ? {
    readonly [K in keyof U]: AnnotationOfRecord<U[K], A> & {
      readonly [V in D]: K;
    };
  }[keyof U]
  : never;
