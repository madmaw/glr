import { type ReadonlyRecord } from 'base/record';
import { type TypeDef } from 'base/type/definition';
import {
  type FlattenedMapOf,
  flattenMapOfType,
  flattenMapOfValue,
} from 'base/type/flatten_map_of';
import { type ReadonlyOf } from 'base/type/readonly_of';
import { type ValueTypeOf } from 'base/type/value_type_of';
import { type Mock } from 'vitest';
import {
  type discriminatingUnionTypeDef,
  listTypeDef,
  literalNumericTypeDef,
  mapTypeDef,
  nullableStructuredCoordinateTypeDef,
  structuredTypeDef,
} from './types';

describe('FlattenedMapOf', function () {
  describe('literal', function () {
    it('passes type checking', function () {
      const t: FlattenedMapOf<
        typeof literalNumericTypeDef,
        boolean,
        'l'
      > = {
        l: true,
      };
      expect(t).toBeDefined();
    });

    it('passes checking with a segment override', function () {
      const t: FlattenedMapOf<
        typeof literalNumericTypeDef,
        boolean,
        'l',
        'n'
      > = {
        l: true,
      };
      expect(t).toBeDefined();
    });
  });

  describe('nullable', function () {
    it('passes type checking', function () {
      const t: FlattenedMapOf<
        typeof nullableStructuredCoordinateTypeDef,
        boolean,
        'n'
      > = {
        n: true,
        'n.x': true,
        'n.y': true,
      };
      expect(t).toBeDefined();
    });

    it('passes type checking with omitted fields', function () {
      const t: FlattenedMapOf<
        typeof nullableStructuredCoordinateTypeDef,
        boolean,
        'n'
      > = {
        n: true,
      };
      expect(t).toBeDefined();
    });
  });

  describe('list', function () {
    it('passes type checking', function () {
      const t: FlattenedMapOf<
        typeof listTypeDef,
        boolean,
        'l'
      > = {
        l: true,
        'l.0': true,
        // error
        // 'x': false,
      };
      expect(t).toBeDefined();
    });

    it('passes type checking with override', function () {
      const t: FlattenedMapOf<
        typeof listTypeDef,
        boolean,
        'l',
        'n'
      > = {
        l: true,
        'l.n': true,
      };
      expect(t).toBeDefined();
    });
  });

  describe('map', function () {
    it('passes type checking', function () {
      const t: FlattenedMapOf<
        typeof mapTypeDef,
        boolean,
        'm'
      > = {
        m: true,
        'm.a': true,
        'm.a.x': true,
        'm.a.y': true,
        'm.b': true,
        'm.b.x': true,
        'm.b.y': true,
        // error
        // 'm.c': true,
      };
      expect(t).toBeDefined();
    });

    it('passes type checking with override', function () {
      const t: FlattenedMapOf<
        typeof mapTypeDef,
        boolean,
        'm',
        'n'
      > = {
        m: true,
        'm.n': true,
        'm.n.x': true,
        'm.n.y': true,
      };
      expect(t).toBeDefined();
    });
  });

  describe('structured', function () {
    it('passes type checking', function () {
      const t: FlattenedMapOf<
        typeof structuredTypeDef,
        boolean,
        'r'
      > = {
        r: true,
        'r.list': true,
        'r.list.0': false,
        'r.list.1': false,
        'r.literal': true,
      };
      expect(t).toBeDefined();
    });

    it('passes type checking with override', function () {
      const t: FlattenedMapOf<
        typeof structuredTypeDef,
        boolean,
        'r',
        'n'
      > = {
        r: true,
        'r.list': true,
        'r.list.n': false,
        'r.literal': true,
      };
      expect(t).toBeDefined();
    });
  });

  describe('discriminating union', function () {
    it('passes type checking', function () {
      const t: FlattenedMapOf<
        typeof discriminatingUnionTypeDef,
        boolean,
        'd'
      > = {
        d: true,
        'd.disc': true,
        'd.a.list': true,
        'd.a.list.0': true,
        'd.a.literal': true,
        'd.b.x': true,
        'd.b.y': true,
      };
      expect(t).toBeDefined();
    });

    it('passes type checking with optional fields omitted', function () {
      const t: FlattenedMapOf<
        typeof discriminatingUnionTypeDef,
        boolean,
        'd'
      > = {
        d: true,
        'd.disc': true,
      };
      expect(t).toBeDefined();
    });

    it('passes type checking with override', function () {
      const t: FlattenedMapOf<
        typeof discriminatingUnionTypeDef,
        boolean,
        'd',
        'n'
      > = {
        d: true,
        'd.disc': true,
        'd.a.list': true,
        'd.a.list.n': true,
        'd.a.literal': true,
        'd.b.x': true,
        'd.b.y': true,
      };
      expect(t).toBeDefined();
    });
  });
});

describe('flattenMapOfValue', function () {
  let stringifyMapper: Mock<[TypeDef, string, string, ValueTypeOf<TypeDef>], string>;
  let typePathMapper: Mock<[TypeDef, string, string, ValueTypeOf<TypeDef>], string>;

  beforeEach(function () {
    stringifyMapper = vitest.fn(function (_def, _valuePath, _typePath, value) {
      return JSON.stringify(value);
    });
    typePathMapper = vitest.fn(function (_def, _valuePath, typePath, _value) {
      return typePath;
    });
  });

  describe('literal', function () {
    let value: FlattenedMapOf<
      typeof literalNumericTypeDef,
      string,
      'n'
    >;

    beforeEach(function () {
      value = flattenMapOfValue(
        literalNumericTypeDef,
        1,
        stringifyMapper,
        'n',
      );
    });

    it('sets the fields of the map', function () {
      expect(value).toEqual({
        n: '1',
      });
    });

    it('calls the mapping function with the expected parameters', function () {
      expect(stringifyMapper).toHaveBeenCalledTimes(1);
      expect(stringifyMapper).toHaveBeenCalledWith(
        literalNumericTypeDef,
        'n',
        'n',
        1,
      );
    });
  });

  describe('nullable', function () {
    let value: FlattenedMapOf<
      typeof nullableStructuredCoordinateTypeDef,
      string,
      'n'
    >;

    beforeEach(function () {
      value = flattenMapOfValue(
        nullableStructuredCoordinateTypeDef,
        null,
        stringifyMapper,
        'n',
      );
    });

    it('sets the fields of the map', function () {
      expect(value).toEqual({
        n: 'null',
      });
    });

    it('calls the mapping function with the expected parameters', function () {
      expect(stringifyMapper).toHaveBeenCalledTimes(1);
      expect(stringifyMapper).toHaveBeenCalledWith(
        nullableStructuredCoordinateTypeDef,
        'n',
        'n',
        null,
      );
    });
  });

  describe('list', function () {
    let value: FlattenedMapOf<
      typeof listTypeDef,
      string,
      'l'
    >;
    const list: readonly number[] = [
      1,
      2,
      3,
    ];

    beforeEach(function () {
      value = flattenMapOfValue(
        listTypeDef,
        list,
        stringifyMapper,
        'l',
      );
    });

    it('flattens', function () {
      expect(value).toEqual({
        l: '[1,2,3]',
        'l.0': '1',
        'l.1': '2',
        'l.2': '3',
      });
    });

    it('calls the mapping function with the expected parameters', function () {
      expect(stringifyMapper).toHaveBeenCalledTimes(4);
      expect(stringifyMapper).toHaveBeenNthCalledWith(
        1,
        listTypeDef,
        'l',
        'l',
        list,
      );
      expect(stringifyMapper).toHaveBeenNthCalledWith(
        2,
        literalNumericTypeDef,
        'l.0',
        'l.n',
        list[0],
      );
      expect(stringifyMapper).toHaveBeenNthCalledWith(
        3,
        literalNumericTypeDef,
        'l.1',
        'l.n',
        list[1],
      );
      expect(stringifyMapper).toHaveBeenNthCalledWith(
        4,
        literalNumericTypeDef,
        'l.2',
        'l.n',
        list[2],
      );
    });
  });

  describe('map', function () {
    let value: FlattenedMapOf<
      typeof mapTypeDef,
      string,
      'm'
    >;

    const map: ReadonlyRecord<'a' | 'b', { x: number, y: number }> = {
      a: {
        x: 1,
        y: 2,
      },
      b: {
        x: 3,
        y: 4,
      },
    };

    beforeEach(function () {
      value = flattenMapOfValue(
        mapTypeDef,
        map,
        stringifyMapper,
        'm',
      );
    });

    it('flattens', function () {
      expect(value).toEqual({
        m: '{"a":{"x":1,"y":2},"b":{"x":3,"y":4}}',
        'm.a': '{"x":1,"y":2}',
        'm.a.x': '1',
        'm.a.y': '2',
        'm.b': '{"x":3,"y":4}',
        'm.b.x': '3',
        'm.b.y': '4',
      });
    });
  });

  describe('structured', function () {
    let value: FlattenedMapOf<
      typeof structuredTypeDef,
      string,
      'r'
    >;

    const record: ValueTypeOf<ReadonlyOf<typeof structuredTypeDef>> = {
      literal: 1,
      list: [2],
    };

    beforeEach(function () {
      value = flattenMapOfValue(
        structuredTypeDef,
        record,
        stringifyMapper,
        'r',
      );
    });

    it('sets the fields of the record', function () {
      expect(value).toEqual({
        r: '{"literal":1,"list":[2]}',
        'r.literal': '1',
        'r.list': '[2]',
        'r.list.0': '2',
      });
    });

    it('calls the mapping function the expected number of times', function () {
      expect(stringifyMapper).toHaveBeenCalledTimes(4);
    });

    it('calls the mapping function with the expected paths', function () {
      value = flattenMapOfValue(
        structuredTypeDef,
        record,
        typePathMapper,
        'r',
      );
      expect(value).toEqual({
        r: 'r',
        'r.literal': 'r.literal',
        'r.list': 'r.list',
        'r.list.0': 'r.list.n',
      });
    });
  });
});

// TODO (exercised by 'flattenMapOfValue)
// describe('flattenMapOfMutableValue', function () {
// });

describe('flattenMapOfType', function () {
  let mapper: Mock<[TypeDef, string]>;
  beforeEach(function () {
    mapper = vitest.fn(function (def: TypeDef, _path: string) {
      return def;
    });
  });

  describe('literal', function () {
    let value: FlattenedMapOf<
      typeof literalNumericTypeDef,
      TypeDef,
      'n',
      'n'
    >;
    beforeEach(function () {
      value = flattenMapOfType(
        literalNumericTypeDef,
        mapper,
        'n',
        'n',
      );
    });

    it('sets the fields of the record', function () {
      expect(value).toEqual({
        n: literalNumericTypeDef,
      });
    });
  });

  // TODO complete the tests (note that this is exercised by the `flatten_types_of.test.ts`)
});
