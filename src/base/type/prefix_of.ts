import { type StructuredFieldKey } from './definition';

export type PrefixOf<
  Prefix extends string,
  Key extends string | number | symbol,
> = Key extends StructuredFieldKey ? Prefix extends '' ? `${Key}`
  : `${Prefix}.${Key}`
  : never;

export function prefixOf(prefix: string, postfix: string | number) {
  return prefix === '' ? `${postfix}` : `${prefix}.${postfix}`;
}
