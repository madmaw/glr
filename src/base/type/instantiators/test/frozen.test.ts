import { instantiateFrozen } from 'base/type/instantiators/frozen';
import {
  type ReadonlyOf,
  readonlyOf,
} from 'base/type/readonly_of';
import {
  discriminatingUnionTypeDef,
  listTypeDef,
  literalNumericTypeDef,
  mapTypeDef,
  structuredTypeDef,
} from 'base/type/test/types';
import { type ValueTypeOf } from 'base/type/value_type_of';
import { expectEquals } from 'testing/helpers';

describe('freeze', function () {
  describe('literal', function () {
    let value: number;
    const input = 1;

    beforeEach(function () {
      value = instantiateFrozen(readonlyOf(literalNumericTypeDef), input);
    });

    it('passes the value', function () {
      expect(value).toBe(input);
    });
  });

  describe('list', function () {
    let list: readonly number[];
    const input = [1];

    beforeEach(function () {
      list = instantiateFrozen(readonlyOf(listTypeDef), input);
    });

    it('keeps the value', function () {
      expect(list).toEqual(input);
    });

    it('is frozen', function () {
      expect(function () {
        // cast it back to being mutable so we can illegally modify it
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        (list as number[]).push(2);
      }).toThrow();
      expect(list).toEqual(input);
    });
  });

  describe('map', function () {
    let map: ValueTypeOf<ReadonlyOf<typeof mapTypeDef>>;
    const input: ValueTypeOf<ReadonlyOf<typeof mapTypeDef>> = {
      a: {
        x: 1,
        y: 2,
      },
      b: {
        x: 2,
        y: 3,
      },
    };

    beforeEach(function () {
      map = instantiateFrozen(mapTypeDef, input);
    });

    it('keeps the value', function () {
      expect(map).toEqual(input);
    });

    it('is frozen', function () {
      expect(function () {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
        (map as any)['a'] = input.b;
      }).toThrow();
      expect(map).toEqual(input);
    });
  });

  describe('structured', function () {
    let struct: ValueTypeOf<ReadonlyOf<typeof structuredTypeDef>>;
    const input: ValueTypeOf<typeof structuredTypeDef> = {
      list: undefined,
      literal: 1,
    };

    beforeEach(function () {
      struct = instantiateFrozen(readonlyOf(structuredTypeDef), input);
    });

    it('keeps the value', function () {
      expect(struct).toEqual(input);
    });

    it('is frozen', function () {
      expect(function () {
        // cast it back to being mutable so we can illegally modify it
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        (struct as ValueTypeOf<typeof structuredTypeDef>).literal = 1;
      }).toThrow();
      expect(struct).toEqual(input);
    });
  });

  describe('discriminating union', function () {
    let discriminatingUnion: ValueTypeOf<ReadonlyOf<typeof discriminatingUnionTypeDef>>;
    const input: ValueTypeOf<typeof discriminatingUnionTypeDef> = {
      disc: 'a',
      list: [],
      literal: 1,
    };

    beforeEach(function () {
      discriminatingUnion = instantiateFrozen(readonlyOf(discriminatingUnionTypeDef), input);
    });

    it('keeps the value', function () {
      expect(discriminatingUnion).toEqual(input);
    });

    it('is frozen', function () {
      // cast it back to being mutable so we can illegally modify it
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const du = discriminatingUnion as ValueTypeOf<typeof discriminatingUnionTypeDef>;
      expectEquals(du.disc, 'a');
      expect(function () {
        du.literal = 2;
      }).toThrow();
      expect(du).toEqual(input);
    });
  });
});
