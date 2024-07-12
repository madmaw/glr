import {
  type FlattenedOf,
  flattenTypesOf,
} from 'base/type/flatten_types_of';
import {
  discriminatingUnionDiscriminatorTypeDef,
  discriminatingUnionTypeDef,
  listTypeDef,
  literalNumericTypeDef,
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
      const flattened: FlattenedOf<typeof literalNumericTypeDef, 'l'> = expected;
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
      const flattened: FlattenedOf<typeof nullableStructuredCoordinateTypeDef, 'c'> = expected;
      expected = flattened;
      expect(flattened).toBeDefined();
    });
  });

  describe('list', function () {
    it('passes type checking', function () {
      const flattened: FlattenedOf<typeof listTypeDef, 'l'> = {
        l: listTypeDef,
        'l.0': literalNumericTypeDef,
        'l.1': literalNumericTypeDef,
      };
      expect(flattened).toBeDefined();
    });

    it('passes type checking with segment override', function () {
      const flattened: FlattenedOf<typeof listTypeDef, 'l', 'n'> = {
        l: listTypeDef,
        'l.n': literalNumericTypeDef,
      };
      expect(flattened).toBeDefined();
    });

    it('can look up via expression index', function () {
      const flattened: FlattenedOf<typeof listTypeDef, 'l'> = {
        l: listTypeDef,
        'l.0': literalNumericTypeDef,
        'l.1': literalNumericTypeDef,
        'l.2': literalNumericTypeDef,
      };
      const x = flattened[`l.${1}`];
      expect(x).toBeDefined();
    });
  });

  describe('structured', function () {
    it('passes type checking', function () {
      let expected = {
        r: structuredTypeDef,
        'r.literal': literalNumericTypeDef,
        'r.list': listTypeDef,
      } as const;
      const flattened: FlattenedOf<typeof structuredTypeDef, 'r'> = {
        ...expected,
        // cannot back-assign numeric indexes
        'r.list.0': literalNumericTypeDef,
      };
      expected = flattened;
      expect(flattened).toBeDefined();
    });

    it('passes type checking with segment override', function () {
      let expected = {
        r: structuredTypeDef,
        'r.literal': literalNumericTypeDef,
        'r.list': listTypeDef,
        'r.list.e': literalNumericTypeDef,
      } as const;
      const flattened: FlattenedOf<typeof structuredTypeDef, 'r', 'e'> = expected;
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
        'd.a.literal': literalNumericTypeDef,
        'd.b': structuredCoordinateTypeDef,
        'd.b.x': literalNumericTypeDef,
        'd.b.y': literalNumericTypeDef,
      } as const;
      const flattened: FlattenedOf<typeof discriminatingUnionTypeDef, 'd'> = {
        ...expected,
        'd.a.list.0': literalNumericTypeDef,
      };
      expected = flattened;
      expect(flattened).toBeDefined();
    });

    it('passes type checking with segment override', function () {
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
      const flattened: FlattenedOf<typeof discriminatingUnionTypeDef, 'd', 'x'> = expected;
      expected = flattened;
      expect(flattened).toBeDefined();
    });
  });

  describe('prefixing', function () {
    it('omits the prefix if empty', function () {
      let expected = {
        '': discriminatingUnionTypeDef,
        disc: discriminatingUnionDiscriminatorTypeDef,
        a: structuredTypeDef,
        'a.list': listTypeDef,
        'a.literal': literalNumericTypeDef,
        b: structuredCoordinateTypeDef,
        'b.x': literalNumericTypeDef,
        'b.y': literalNumericTypeDef,
        // error
        // 'a.c': literalNumericTypeDef,
      } as const;
      const flattened: FlattenedOf<typeof discriminatingUnionTypeDef, ''> = expected;
      expected = flattened;
      expect(flattened).toBeDefined();
    });

    it('omits the prefix with segment override', function () {
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
      const flattened: FlattenedOf<typeof discriminatingUnionTypeDef, '', 'override'> = expected;
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
