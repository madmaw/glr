import {
  type FlattenedOf,
  flattenedOf,
} from 'base/type/flattened_of';
import {
  discriminatingUnionDiscriminatorTypeDef,
  discriminatingUnionTypeDef,
  listTypeDef,
  literalNumericTypeDef,
  recordCoordinateTypeDef,
  recordTypeDef,
} from './types';

describe('FlattenedOf', function () {
  describe('passes type checking', function () {
    it('compiles a literal', function () {
      const flattened: FlattenedOf<typeof literalNumericTypeDef, 'l'> = {
        l: literalNumericTypeDef,
      };
      expect(flattened).toBeDefined();
    });

    it('compiles a list', function () {
      const flattened: FlattenedOf<typeof listTypeDef, 'l'> = {
        l: listTypeDef,
        'l.0': literalNumericTypeDef,
      };
      expect(flattened).toBeDefined();
    });

    it('compiles a record', function () {
      const flattened: FlattenedOf<typeof recordTypeDef, 'r'> = {
        r: recordTypeDef,
        'r.literal': literalNumericTypeDef,
        'r.list': listTypeDef,
        'r.list.0': literalNumericTypeDef,
      };
      expect(flattened).toBeDefined();
    });

    it('compiles a discriminating union', function () {
      const flattened: FlattenedOf<typeof discriminatingUnionTypeDef, 'd'> = {
        d: discriminatingUnionTypeDef,
        'd.disc': discriminatingUnionDiscriminatorTypeDef,
        'd.a': recordTypeDef,
        'd.a.list': listTypeDef,
        'd.a.literal': literalNumericTypeDef,
      };
      expect(flattened).toBeDefined();
    });
  });
});

describe('flatten', function () {
  it('produces the expected literal', function () {
    const flattened = flattenedOf(literalNumericTypeDef, 'l');
    expect(flattened).toEqual({
      l: literalNumericTypeDef,
    });
  });

  it('produces the expected list', function () {
    const flattened = flattenedOf(listTypeDef, 'l');
    expect(flattened).toEqual({
      l: listTypeDef,
      'l.0': literalNumericTypeDef,
    });
  });

  it('produces the expected record', function () {
    const flattened = flattenedOf(recordTypeDef, 'r');
    expect(flattened).toEqual({
      r: recordTypeDef,
      'r.literal': literalNumericTypeDef,
      'r.list': listTypeDef,
      'r.list.0': literalNumericTypeDef,
    });
  });

  it('produces the expected discriminating union', function () {
    const flattened = flattenedOf(discriminatingUnionTypeDef, 'd');
    expect(flattened).toEqual({
      d: discriminatingUnionTypeDef,
      'd.disc': discriminatingUnionDiscriminatorTypeDef,
      'd.a': recordTypeDef,
      'd.a.list': listTypeDef,
      'd.a.list.0': literalNumericTypeDef,
      'd.a.literal': literalNumericTypeDef,
      'd.b': recordCoordinateTypeDef,
      'd.b.x': literalNumericTypeDef,
      'd.b.y': literalNumericTypeDef,
    });
  });
});
