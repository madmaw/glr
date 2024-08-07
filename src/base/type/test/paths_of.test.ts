import { type PathsOf } from 'base/type/paths_of';
import {
  type discriminatingUnionTypeDef,
  type listTypeDef,
  type literalNumericTypeDef,
  type nullableStructuredCoordinateTypeDef,
  type structuredTypeDef,
} from './types';

describe('PathsOf', function () {
  describe('literal', function () {
    it('contains just the keys', function () {
      const paths: Record<PathsOf<typeof literalNumericTypeDef, 'd'>, ''> = {
        d: '',
      };
      expect(paths).toBeDefined();
    });

    it('does not change with an override', function () {
      const paths: Record<PathsOf<typeof literalNumericTypeDef, 'd', 'a'>, ''> = {
        d: '',
      };
      expect(paths).toBeDefined();
    });
  });

  describe('nullable', function () {
    it('contains just the keys', function () {
      const paths: Record<PathsOf<typeof nullableStructuredCoordinateTypeDef, 'c'>, ''> = {
        c: '',
        'c.x': '',
        'c.y': '',
      };
      expect(paths).toBeDefined();
    });
  });

  describe('list', function () {
    it('contains just the keys', function () {
      const paths: Record<PathsOf<typeof listTypeDef, 'l'>, ''> = {
        l: '',
        'l.0': '',
        'l.1': '',
        'l.84': '',
        // error
        // 'l.x': '',
      };
      expect(paths).toBeDefined();
    });

    it('uses the specified override', function () {
      const paths: Record<PathsOf<typeof listTypeDef, 'l', 'x'>, ''> = {
        l: '',
        // error
        // 'l.0': '',
        'l.x': '',
      };
      expect(paths).toBeDefined();
    });
  });

  describe('structured', function () {
    it('contains just the keys', function () {
      const paths: Record<PathsOf<typeof structuredTypeDef>, ''> = {
        '': '',
        list: '',
        'list.0': '',
        literal: '',
      };
      expect(paths).toBeDefined();
    });

    it('uses the specified override', function () {
      const paths: Record<PathsOf<typeof structuredTypeDef, '', 'n'>, ''> = {
        '': '',
        list: '',
        'list.n': '',
        literal: '',
      };
      expect(paths).toBeDefined();
    });
  });

  describe('discriminating union', function () {
    it('contains just the keys', function () {
      const paths: Record<PathsOf<typeof discriminatingUnionTypeDef>, ''> = {
        '': '',
        disc: '',
        a: '',
        'a.list': '',
        'a.list.0': '',
        'a.literal': '',
        b: '',
        'b.x': '',
        'b.y': '',
      };
      expect(paths).toBeDefined();
    });

    it('uses the specified override', function () {
      const paths: Record<PathsOf<typeof discriminatingUnionTypeDef, '', 'n'>, ''> = {
        '': '',
        disc: '',
        a: '',
        'a.list': '',
        'a.list.n': '',
        'a.literal': '',
        b: '',
        'b.x': '',
        'b.y': '',
      };
      expect(paths).toBeDefined();
    });
  });
});
