export type Descriptor<R, M> = {
  aReadonly: R,

  aMutable: M,

  create(proto: R): M,
};
