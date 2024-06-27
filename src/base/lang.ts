// converts a union type to an intersection type
// https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type
export type UnionToIntersection<
  U,
> = (U extends unknown ? (x: U) => void : never) extends ((x: infer I) => void) ? I
  : never;
