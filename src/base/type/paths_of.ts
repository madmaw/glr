import { type TypeDef } from './definition';
import { type FlattenedOf } from './flattened_of';

export type PathsOf<F extends TypeDef, Prefix extends string = ''> = keyof FlattenedOf<F, Prefix>;
