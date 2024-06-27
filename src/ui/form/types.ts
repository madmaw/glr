import { type AnnotationOf } from 'base/type/annotation_of';
import { type TypeDef } from 'base/type/definition';
import { type OptionalOf } from 'base/type/optional_of';
import { type TypeOf } from 'base/type/type_of';

export type Form<F extends TypeDef> = {
  value: TypeOf<OptionalOf<F>>,
  errors: AnnotationOf<F, string[]>,
};
