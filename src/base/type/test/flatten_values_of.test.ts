import {
  type FlattenedValuesOf,
  flattenMutableValuesOf,
  flattenValuesOf,
} from 'base/type/flatten_values_of';
import {
  discriminatingUnionTypeDef,
  listTypeDef,
  literalNumericTypeDef,
  nullableRecordCoordinateTypeDef,
  recordTypeDef,
} from 'base/type/test/types';
import { type ValueTypeOf } from 'base/type/value_type_of';
import {
  expectDefined,
  expectEquals,
} from 'testing/helpers';

describe('FlattenedValuesOf', function () {
  describe('literal', function () {
    it('passes type checking', function () {
      const t: FlattenedValuesOf<
        typeof literalNumericTypeDef,
        true,
        'n'
      > = {
        n: {
          value: 1,
          setValue: vitest.fn(),
          typePath: 'n',
        },
      };
      expect(t).toBeDefined();
    });
  });

  describe('nullable', function () {
    it('passes type checking', function () {
      const t: FlattenedValuesOf<
        typeof nullableRecordCoordinateTypeDef,
        true,
        'b'
      > = {
        b: {
          value: null,
          setValue: vitest.fn(),
          typePath: 'b',
        },
        'b.x': {
          value: 1,
          setValue: vitest.fn(),
          typePath: 'b.x',
        },
        'b.y': {
          value: 2,
          setValue: vitest.fn(),
          typePath: 'b.y',
        },
      };

      expect(t).toBeDefined();
    });

    it('passes type checking with missing child fields', function () {
      const t: FlattenedValuesOf<
        typeof nullableRecordCoordinateTypeDef,
        true,
        'b'
      > = {
        b: {
          value: null,
          setValue: vitest.fn(),
          typePath: 'b',
        },
      };
      expect(t).toBeDefined();
    });
  });

  describe('list', function () {
    it('passes type checking', function () {
      const t: FlattenedValuesOf<
        typeof listTypeDef,
        true,
        'l'
      > = {
        l: {
          value: [],
          setValue: vitest.fn(),
          typePath: 'l',
        },
        'l.0': {
          value: 1,
          setValue: vitest.fn(),
          typePath: 'l.n',
        },
      };
      expect(t).toBeDefined();
    });
  });

  describe('record', function () {
    it('passes type checking', function () {
      const t: FlattenedValuesOf<
        typeof recordTypeDef,
        true,
        'r'
      > = {
        r: {
          value: {
            list: [],
            literal: 1,
          },
          setValue: vitest.fn(),
          typePath: 'r',
        },
        'r.list': {
          value: [],
          setValue: vitest.fn(),
          typePath: 'r.list',
        },
        'r.literal': {
          value: 1,
          setValue: vitest.fn(),
          typePath: 'r.literal',
        },
      };
      expect(t).toBeDefined();
    });

    it('passes type checking with missing optional fields', function () {
      const t: FlattenedValuesOf<
        typeof recordTypeDef,
        true,
        'r'
      > = {
        r: {
          value: {},
          setValue: vitest.fn(),
          typePath: 'r',
        },
      };
      expect(t).toBeDefined();
    });
  });

  describe('discriminating union', function () {
    it('passes type checking', function () {
      const t: FlattenedValuesOf<
        typeof discriminatingUnionTypeDef,
        true,
        'd'
      > = {
        d: {
          value: {
            disc: 'a',
          },
          setValue: vitest.fn(),
          typePath: 'd',
        },
        'd.a.list': {
          value: [],
          setValue: vitest.fn(),
          typePath: 'd.a.list',
        },
        'd.a.list.0': {
          value: 1,
          setValue: vitest.fn(),
          typePath: 'd.a.list.n',
        },
        'd.a.literal': {
          value: 1,
          setValue: vitest.fn(),
          typePath: 'd.a.literal',
        },
        'd.b.x': {
          value: 1,
          setValue: vitest.fn(),
          typePath: 'd.b.x',
        },
        'd.b.y': {
          value: 1,
          setValue: vitest.fn(),
          typePath: 'd.b.y',
        },
        'd.disc': {
          value: 'a',
          typePath: 'd.disc',
        },
      };
      expect(t).toBeDefined();
    });
  });
});

describe('flattenValuesOf', function () {
  describe('literal', function () {
    it('produces the expected result', function () {
      const value = 1;
      const flattened = flattenValuesOf(literalNumericTypeDef, value, 'l');
      expect(flattened).toEqual({
        l: {
          value,
          typePath: 'l',
        },
      });
    });
  });

  describe('nullable', function () {
    it('produces the expected result', function () {
      const flattened = flattenValuesOf(nullableRecordCoordinateTypeDef, null, 'n');
      expect(flattened).toEqual({
        n: {
          value: null,
          typePath: 'n',
        },
      });
    });
  });
});

describe('flattenMutableValuesOf', function () {
  describe('literal', function () {
    it('produces the expected result', function () {
      const value = 1;
      const flattened = flattenMutableValuesOf(literalNumericTypeDef, value, 'l');
      expect(flattened).toEqual({
        l: {
          value,
          typePath: 'l',
        },
      });
    });
  });

  describe('nullable', function () {
    it('produces the expected result', function () {
      const flattened = flattenMutableValuesOf(nullableRecordCoordinateTypeDef, null, 'n');
      expect(flattened).toEqual({
        n: {
          value: null,
          typePath: 'n',
        },
      });
    });
  });

  describe('list', function () {
    let l: ValueTypeOf<typeof listTypeDef>;
    let flattened: FlattenedValuesOf<typeof listTypeDef, true, 'l'>;

    beforeEach(function () {
      l = [
        1,
        2,
      ];
      flattened = flattenMutableValuesOf(
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
      expectDefined(flattened['l.0'].setValue);
      flattened['l.0'].setValue(3);
      expect(l).toEqual([
        3,
        2,
      ]);
    });
  });

  describe('record', function () {
    let r: ValueTypeOf<typeof recordTypeDef>;
    let flattened: FlattenedValuesOf<typeof recordTypeDef, true, 'r'>;

    beforeEach(function () {
      r = {
        list: [1],
        literal: 2,
      };
      flattened = flattenMutableValuesOf(
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
      expectDefined(flattened['r.literal']?.setValue);
      flattened['r.literal'].setValue(3);
      expect(r.literal).toBe(3);
    });
  });

  describe('discriminating union', function () {
    let d: ValueTypeOf<typeof discriminatingUnionTypeDef>;
    let flattened: FlattenedValuesOf<typeof discriminatingUnionTypeDef, true, 'd'>;

    beforeEach(function () {
      d = {
        disc: 'a',
        list: [0],
      };
      flattened = flattenMutableValuesOf(
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
      expectDefined(flattened['d.a.literal']?.setValue);
      flattened['d.a.literal'].setValue(100);
      expectEquals(d.disc, 'a');
      expect(d.literal).toBe(100);
    });
  });
});
