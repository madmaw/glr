import { type AnnotationOf } from 'base/type/annotation_of';
import { type TypeDef } from 'base/type/definition';
import { type OptionalOf } from 'base/type/optional_of';
import { type PathsOf } from 'base/type/paths_of';
import { type TypeOf } from 'base/type/type_of';

export type Form<
  F extends TypeDef,
  Error = string,
  ErrorKey extends string = 'errors',
> = {
  value: TypeOf<OptionalOf<F>>,
  errors: AnnotationOf<F, readonly Error[], ErrorKey>,
};

export type FormProps<
  F extends TypeDef,
  Error = string,
  ErrorKey extends string = 'errors',
> = {
  form: Form<F, Error, ErrorKey>,
  onChange: (source: PathsOf<F>, value: TypeOf<OptionalOf<F>>) => void,
  onSubmit: (value: TypeOf<OptionalOf<F>>) => void,
  onClear: (source: PathsOf<F>) => void,
};
