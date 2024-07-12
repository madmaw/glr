import {
  type FlattenedTypesOf,
  flattenTypesOf,
} from 'base/type/flatten_types_of';
import {
  discriminatingUnionDiscriminatorTypeDef,
  discriminatingUnionTypeDef,
  listTypeDef,
  literalNumericTypeDef,
  mapTypeDef,
  nullableStructuredCoordinateTypeDef,
  structuredCoordinateTypeDef,
  structuredTypeDef,
} from './types';

describe('FlattenedOf', function () {
  describe('literal', function () {
    it('passes type checking', function () {
      let expected = {
        l: literalNumericTypeDef,
      } as const;
      const flattened: FlattenedTypesOf<typeof literalNumericTypeDef, 'l'> = expected;
      expected = flattened;
      expect(flattened).toBeDefined();
    });
  });

  describe('nullable', function () {
    it('passes type checking', function () {
      let expected = {
        c: nullableStructuredCoordinateTypeDef,
        'c.x': literalNumericTypeDef,
        'c.y': literalNumericTypeDef,
      };
      const flattened: FlattenedTypesOf<typeof nullableStructuredCoordinateTypeDef, 'c'> = expected;
      expected = flattened;
      expect(flattened).toBeDefined();
    });
  });

  describe('list', function () {
    it('passes type checking', function () {
      const flattened: FlattenedTypesOf<typeof listTypeDef, 'l', 'n'> = {
        l: listTypeDef,
        'l.n': literalNumericTypeDef,
      };
      expect(flattened).toBeDefined();
    });
  });

  describe('map', function () {
    it('passes type checking', function () {
      const flattened: FlattenedTypesOf<typeof mapTypeDef, 'm', 'n'> = {
        m: mapTypeDef,
        'm.n': structuredCoordinateTypeDef,
        'm.n.x': literalNumericTypeDef,
        'm.n.y': literalNumericTypeDef,
      };
      expect(flattened).toBeDefined();
    });
  });

  describe('structured', function () {
    it('passes type checking', function () {
      let expected = {
        r: structuredTypeDef,
        'r.literal': literalNumericTypeDef,
        'r.list': listTypeDef,
        'r.list.e': literalNumericTypeDef,
      } as const;
      const flattened: FlattenedTypesOf<typeof structuredTypeDef, 'r', 'e'> = expected;
      expected = flattened;
      expect(flattened).toBeDefined();
    });
  });

  describe('discriminating union', function () {
    it('passes type checking', function () {
      let expected = {
        d: discriminatingUnionTypeDef,
        'd.disc': discriminatingUnionDiscriminatorTypeDef,
        'd.a': structuredTypeDef,
        'd.a.list': listTypeDef,
        'd.a.list.x': literalNumericTypeDef,
        'd.a.literal': literalNumericTypeDef,
        'd.b': structuredCoordinateTypeDef,
        'd.b.x': literalNumericTypeDef,
        'd.b.y': literalNumericTypeDef,
      } as const;
      const flattened: FlattenedTypesOf<typeof discriminatingUnionTypeDef, 'd', 'x'> = expected;
      expected = flattened;
      expect(flattened).toBeDefined();
    });
  });

  describe('prefixing', function () {
    it('omits the prefix', function () {
      let expected = {
        '': discriminatingUnionTypeDef,
        disc: discriminatingUnionDiscriminatorTypeDef,
        a: structuredTypeDef,
        'a.list': listTypeDef,
        'a.list.override': literalNumericTypeDef,
        'a.literal': literalNumericTypeDef,
        b: structuredCoordinateTypeDef,
        'b.x': literalNumericTypeDef,
        'b.y': literalNumericTypeDef,
      } as const;
      const flattened: FlattenedTypesOf<typeof discriminatingUnionTypeDef, '', 'override'> = expected;
      expected = flattened;
      expect(flattened).toBeDefined();
    });
  });
});

describe('flattenedOf', function () {
  it('produces the expected literal', function () {
    const flattened = flattenTypesOf(literalNumericTypeDef, 'l');
    expect(flattened).toEqual({
      l: literalNumericTypeDef,
    });
  });

  it('produces the expected nullable', function () {
    const flattened = flattenTypesOf(nullableStructuredCoordinateTypeDef, 'n');
    expect(flattened).toEqual({
      n: nullableStructuredCoordinateTypeDef,
      'n.x': literalNumericTypeDef,
      'n.y': literalNumericTypeDef,
    });
  });

  it('produces the expected list', function () {
    const flattened = flattenTypesOf(listTypeDef, 'l');
    expect(flattened).toEqual({
      l: listTypeDef,
      'l.n': literalNumericTypeDef,
    });
  });

  it('produces the expected record', function () {
    const flattened = flattenTypesOf(structuredTypeDef, 'r');
    expect(flattened).toEqual({
      r: structuredTypeDef,
      'r.literal': literalNumericTypeDef,
      'r.list': listTypeDef,
      'r.list.n': literalNumericTypeDef,
    });
  });

  it('produces the expected discriminating union', function () {
    const flattened = flattenTypesOf(discriminatingUnionTypeDef, 'd');
    expect(flattened).toEqual({
      d: discriminatingUnionTypeDef,
      'd.disc': discriminatingUnionDiscriminatorTypeDef,
      'd.a': structuredTypeDef,
      'd.a.list': listTypeDef,
      'd.a.list.n': literalNumericTypeDef,
      'd.a.literal': literalNumericTypeDef,
      'd.b': structuredCoordinateTypeDef,
      'd.b.x': literalNumericTypeDef,
      'd.b.y': literalNumericTypeDef,
    });
  });
});
