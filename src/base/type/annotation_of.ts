import { type ReadonlyRecord } from 'base/record';
import {
  type DiscriminatingUnionTypeDef,
  type ListTypeDef,
  type LiteralTypeDef,
  type RecordTypeDef,
  type RecordTypeDefFields,
  type TypeDef,
} from './definition';

// TODO needs consideration on what fields should be optional here

export type AnnotationOf<
  F extends TypeDef,
  A,
  Key extends string = 'annotation',
> = F extends LiteralTypeDef ? AnnotationsOfLiteral<F, A>
  : F extends ListTypeDef ? AnnotationsOfList<F, A, Key>
  : F extends RecordTypeDef ? AnnotationOfRecord<F, A, Key>
  : F extends DiscriminatingUnionTypeDef ? AnnotationOfDiscriminatingUnion<F, A, Key>
  : never;

type AnnotationsOfLiteral<F extends LiteralTypeDef, A> = F extends LiteralTypeDef ? A : never;

type AnnotationsOfList<
  F extends ListTypeDef,
  A,
  Key extends string,
> = F extends ListTypeDef<infer E> ? {
    readonly children: AnnotationOf<E, A, Key>[],
    readonly annotation: A,
  }
  : never;

type AnnotationOfRecord<
  F extends RecordTypeDef,
  A,
  Key extends string,
> = AnnotationOfRecordFields<F['fields'], A, Key>;

type AnnotationOfRecordFields<
  F extends RecordTypeDefFields,
  A,
  Key extends string,
> = F extends RecordTypeDefFields ? {
    readonly [K in keyof F]: AnnotationOf<F[K]['valueType'], A>;
  } & ReadonlyRecord<Key, A>
  : never;

type AnnotationOfDiscriminatingUnion<
  F extends DiscriminatingUnionTypeDef,
  A,
  Key extends string,
> = F extends DiscriminatingUnionTypeDef<
  infer D,
  infer U
> ? {
    readonly [K in keyof U]: AnnotationOfRecordFields<U[K], A, Key> & {
      readonly [V in D]: K;
    };
  }[keyof U]
  : never;
