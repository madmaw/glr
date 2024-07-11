import { type TypeDef } from 'base/type/definition';
import {
  type FlattenedRecordOf,
  flattenRecordOfValue,
} from 'base/type/flatten_record_of';
import { type ValueTypeOf } from 'base/type/value_type_of';
import { type Mock } from 'vitest';
import {
  type discriminatingUnionTypeDef,
  type listTypeDef,
  literalNumericTypeDef,
  nullableRecordCoordinateTypeDef,
  type recordTypeDef,
} from './types';

describe('FlattenedRecordOf', function () {
  describe('literal', function () {
    it('passes type checking', function () {
      const t: FlattenedRecordOf<
        typeof literalNumericTypeDef,
        boolean,
        'l'
      > = {
        l: true,
      };
      expect(t).toBeDefined();
    });

    it('passes checking with a segment override', function () {
      const t: FlattenedRecordOf<
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
      const t: FlattenedRecordOf<
        typeof nullableRecordCoordinateTypeDef,
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
      const t: FlattenedRecordOf<
        typeof nullableRecordCoordinateTypeDef,
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
      const t: FlattenedRecordOf<
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
      const t: FlattenedRecordOf<
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

  describe('record', function () {
    it('passes type checking', function () {
      const t: FlattenedRecordOf<
        typeof recordTypeDef,
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
      const t: FlattenedRecordOf<
        typeof recordTypeDef,
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
      const t: FlattenedRecordOf<
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
      const t: FlattenedRecordOf<
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
      const t: FlattenedRecordOf<
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

describe('flattenRecordOfValue', function () {
  let mapper: Mock<[TypeDef, string, string, ValueTypeOf<TypeDef>], string>;

  beforeEach(function () {
    mapper = vitest.fn(function (_def, _valuePath, _typePath, value) {
      return JSON.stringify(value);
    });
  });

  describe('literal', function () {
    let value: FlattenedRecordOf<
      typeof literalNumericTypeDef,
      string,
      'n'
    >;

    beforeEach(function () {
      value = flattenRecordOfValue(
        literalNumericTypeDef,
        1,
        mapper,
        'n',
      );
    });

    it('sets the fields of the record', function () {
      expect(value).toEqual({
        n: '1',
      });
    });

    it('calls the mapping function with the expected parameters', function () {
      expect(mapper).toHaveBeenCalledTimes(1);
      expect(mapper).toHaveBeenCalledWith(
        literalNumericTypeDef,
        'n',
        'n',
        1,
      );
    });
  });

  describe('nullable', function () {
    let value: FlattenedRecordOf<
      typeof nullableRecordCoordinateTypeDef,
      string,
      'n'
    >;

    beforeEach(function () {
      value = flattenRecordOfValue(
        nullableRecordCoordinateTypeDef,
        null,
        mapper,
        'n',
      );
    });

    it('sets the fields of the record', function () {
      expect(value).toEqual({
        n: 'null',
      });
    });

    it('calls the mapping function with the expected parameters', function () {
      expect(mapper).toHaveBeenCalledTimes(1);
      expect(mapper).toHaveBeenCalledWith(
        nullableRecordCoordinateTypeDef,
        'n',
        'n',
        null,
      );
    });
  });
});

// describe('flattenMutableRecordOfValue', function () {
// });
