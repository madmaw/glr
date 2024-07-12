// converts a union type to an intersection type
// https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type
export type UnionToIntersection<
  U,
> = (U extends unknown ? (x: U) => void : never) extends ((x: infer I) => void) ? I
  : never;

export type MaybeReadonly<T, R extends boolean> = R extends true ? Readonly<T> : T;

export type MaybePartial<T, P extends boolean> = P extends true ? Partial<T> : T;
