import {
  flatten,
  type FlattenedValuesOf,
} from 'base/type/instantiators/flatten';
import {
  discriminatingUnionTypeDef,
  listTypeDef,
  literalNumericTypeDef,
  recordTypeDef,
} from 'base/type/test/types';
import { type ValueTypeOf } from 'base/type/value_type_of';
import { expectEquals } from 'testing/helpers';

describe('flatten', function () {
  describe('literal', function () {
    it('produces the expected result', function () {
      const value = 1;
      const flattened = flatten(literalNumericTypeDef, value, 'l');
      expect(flattened).toEqual({
        l: {
          value,
          typePath: 'l',
        },
      });
    });
  });

  describe('list', function () {
    let l: ValueTypeOf<typeof listTypeDef>;
    let flattened: FlattenedValuesOf<typeof listTypeDef, 'l'>;

    beforeEach(function () {
      l = [
        1,
        2,
      ];
      flattened = flatten(
        listTypeDef,
        l,
        'l',
      );
    });

    it('produces the expected result', function () {
      expect(flattened).toEqual({
        l: {
          value: l,
          typePath: 'l',
          setValue: undefined,
        },
        'l.0': {
          value: 1,
          typePath: 'l.n',
          setValue: expect.anything(),
        },
        'l.1': {
          value: 2,
          typePath: 'l.n',
          setValue: expect.anything(),
        },
      });
    });

    it('sets the value', function () {
      flattened['l.0'].setValue?.(3);
      expect(l).toEqual([
        3,
        2,
      ]);
    });
  });

  describe('record', function () {
    let r: ValueTypeOf<typeof recordTypeDef>;
    let flattened: FlattenedValuesOf<typeof recordTypeDef, 'r'>;

    beforeEach(function () {
      r = {
        list: [1],
        literal: 2,
      };
      flattened = flatten(
        recordTypeDef,
        r,
        'r',
      );
    });

    it('produces the expected result', function () {
      expect(flattened).toEqual({
        r: {
          value: r,
          typePath: 'r',
          setValue: undefined,
        },
        'r.list': {
          value: r.list,
          typePath: 'r.list',
          setValue: expect.anything(),
        },
        'r.list.0': {
          value: r.list?.[0],
          typePath: 'r.list.n',
          setValue: expect.anything(),
        },
        'r.literal': {
          value: r.literal,
          typePath: 'r.literal',
          setValue: expect.anything(),
        },
      });
    });

    it('sets the value', function () {
      flattened['r.literal'].setValue?.(3);
      expect(r.literal).toBe(3);
    });
  });

  describe('discriminating union', function () {
    let d: ValueTypeOf<typeof discriminatingUnionTypeDef>;
    let flattened: FlattenedValuesOf<typeof discriminatingUnionTypeDef, 'd'>;

    beforeEach(function () {
      d = {
        disc: 'a',
        list: [0],
      };
      flattened = flatten(
        discriminatingUnionTypeDef,
        d,
        'd',
      );
    });

    it('produces the expected result', function () {
      expectEquals(d.disc, 'a');
      expect(flattened).toEqual({
        d: {
          value: d,
          typePath: 'd',
          setValue: undefined,
        },
        'd.disc': {
          value: 'a',
          typePath: 'd.disc',
          setValue: undefined,
        },
        'd.a.list': {
          value: d.list,
          typePath: 'd.a.list',
          setValue: expect.anything(),
        },
        'd.a.list.0': {
          value: d.list?.[0],
          typePath: 'd.a.list.n',
          setValue: expect.anything(),
        },
        'd.a.literal': {
          value: undefined,
          typePath: 'd.a.literal',
          setValue: expect.anything(),
        },
      });
    });

    it('sets the value', function () {
      flattened['d.a.literal'].setValue?.(100);
      expectEquals(d.disc, 'a');
      expect(d.literal).toBe(100);
    });
  });
});
