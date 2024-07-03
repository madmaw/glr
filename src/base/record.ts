export function reverse<
  Key extends string | number | symbol,
  Value extends string | number | symbol,
>(obj: Record<Key, Value>): Record<Value, Key> {
  return Object.keys(obj).reduce((acc, stringKey) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const key = stringKey as Key;
    const value = obj[key];
    acc[value] = key;
    return acc;
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  }, {} as Record<Value, Key>);
}

export function rollup<
  R extends Record<K, V>,
  K extends string | number | symbol = keyof R,
  V = R[K],
>(...records: Partial<R>[]): R {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return records.slice(1).reduce<Partial<R>>((acc, record) => {
    Object.keys(record).forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const k = key as K;
      acc[k] = acc[k] ?? record[k];
    });
    return acc;
  }, records[0]) as R;
}

export function union<
  R1 extends ReadonlyRecord<K1, V1>,
  K1 extends string | number | symbol,
  V1 extends R1[K1],
  R2 extends ReadonlyRecord<K2, V2>,
  K2 extends string | number | symbol,
  V2 extends R2[K2],
>(
  r1: R1,
  r2: R2,
): R1 & R2 {
  return {
    ...r1,
    ...r2,
  };
}

export function map<
  K extends string | number | symbol,
  V,
  R,
>(
  r: ReadonlyRecord<K, V>,
  f: (k: K, v: V) => R,
): Record<K, R> {
  // TODO can use reduce to implement map
  return Object.entries<V>(r).reduce(
    function (acc, [
      k,
      v,
    ]) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const typedKey = k as K;
      acc[typedKey] = f(typedKey, v);
      return acc;
    },
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    {} as Record<K, R>,
  );
}

export function reduce<
  K extends string | number | symbol,
  V,
  A,
>(
  r: ReadonlyRecord<K, V>,
  f: (acc: A, K: K, v: V) => A,
  a: A,
): A {
  return Object.entries<V>(r).reduce(
    function (acc, [
      k,
      v,
    ]) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const typedKey = k as K;
      return f(acc, typedKey, v);
    },
    a,
  );
}

export type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

export type ReadonlyRecord<K extends string | number | symbol, V> = Readonly<Record<K, V>>;
