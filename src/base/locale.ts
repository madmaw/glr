import { exists } from './exists';

export function expandLocales(locales: readonly (string | undefined)[]): readonly string[] {
  return locales
    .filter(exists)
    // allow dropping back to parent locales
    .flatMap(locale => {
      return locale
        .split('-')
        // create the full chain of locales
        .map((_, i, arr) => {
          return arr.slice(0, i + 1)
            .join('-');
        })
        // longest to shortest
        .reverse();
    })
    // remove duplicates
    .filter((value, i, arr) => arr.slice(0, i).indexOf(value) === -1);
}
