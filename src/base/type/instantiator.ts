import { type TypeDef } from './definition';

export type Instantiator = {
  <T extends TypeDef, Source, Instance>(def: T, source: Source): Instance,
};
