import { flatten } from 'base/type/instantiators/flatten';
import {
  discriminatingUnionTypeDef,
  listTypeDef,
  literalNumericTypeDef,
  recordTypeDef,
} from 'base/type/test/types';

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
    it('produces the expected result', function () {
      const l = [
        1,
        2,
      ];
      const flattened = flatten(
        listTypeDef,
        l,
        'l',
      );
      expect(flattened).toEqual({
        l: {
          value: l,
          typePath: 'l',
        },
        'l.0': {
          value: 1,
          typePath: 'l.n',
        },
        'l.1': {
          value: 2,
          typePath: 'l.n',
        },
      });
    });
  });

  describe('record', function () {
    it('produces the expected result', function () {
      const r = {
        list: [1],
        literal: 2,
      };
      const flattened = flatten(
        recordTypeDef,
        r,
        'r',
      );
      expect(flattened).toEqual({
        r: {
          value: r,
          typePath: 'r',
        },
        'r.list': {
          value: r.list,
          typePath: 'r.list',
        },
        'r.list.0': {
          value: r.list[0],
          typePath: 'r.list.n',
        },
        'r.literal': {
          value: r.literal,
          typePath: 'r.literal',
        },
      });
    });
  });

  describe('discriminating union', function () {
    it('produces the expected result', function () {
      const d = {
        disc: 'a' as const,
        list: [0],
      };
      const flattened = flatten(
        discriminatingUnionTypeDef,
        d,
        'd',
      );
      expect(flattened).toEqual({
        d: {
          value: d,
          typePath: 'd',
        },
        'd.disc': {
          value: 'a',
          typePath: 'd.disc',
        },
        'd.list': {
          value: d.list,
          typePath: 'd.list',
        },
        'd.list.0': {
          value: d.list[0],
          typePath: 'd.list.n',
        },
        'd.literal': {
          value: undefined,
          typePath: 'd.literal',
        },
      });
    });
  });
});
