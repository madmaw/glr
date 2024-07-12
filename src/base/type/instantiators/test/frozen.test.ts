import { instantiateFrozen } from 'base/type/instantiators/frozen';
import {
  type ReadonlyOf,
  readonlyOf,
} from 'base/type/readonly_of';
import {
  discriminatingUnionTypeDef,
  listTypeDef,
  literalNumericTypeDef,
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

  describe('structured', function () {
    let record: ValueTypeOf<ReadonlyOf<typeof structuredTypeDef>>;
    const input: ValueTypeOf<typeof structuredTypeDef> = {
      list: undefined,
      literal: 1,
    };

    beforeEach(function () {
      record = instantiateFrozen(readonlyOf(structuredTypeDef), input);
    });

    it('keeps the value', function () {
      expect(record).toEqual(input);
    });

    it('is frozen', function () {
      expect(function () {
        // cast it back to being mutable so we can illegally modify it
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        (record as ValueTypeOf<typeof structuredTypeDef>).literal = 1;
      }).toThrow();
      expect(record).toEqual(input);
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
