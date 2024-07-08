import { type ValueTypeOf } from 'base/type/value_type_of';
import {
  type discriminatingUnionTypeDef,
  type listTypeDef,
  type literalNumericTypeDef,
  type nullableRecordCoordinateTypeDef,
  type recordTypeDef,
} from './types';

// We are just testing this file compiles. As we are just producing types there is no code for the tests
// to execute
describe('ValueTypeOf', function () {
  describe('literal', function () {
    it('has the expected shape', function () {
      let expected: number = 1;
      const t: ValueTypeOf<typeof literalNumericTypeDef> = expected;
      // test assignment in both directions
      expected = t;
      expect(t).toBeDefined();
    });
  });

  describe('nullable', function () {
    it('has the expected shape when null', function () {
      let expected: {
        x: number,
        y: number,
      } | null = null;
      const t: ValueTypeOf<typeof nullableRecordCoordinateTypeDef> = expected;
      expected = t;
      expect(t).toBeNull();
    });

    it('has the expected shape when non-null', function () {
      let expected: {
        x: number,
        y: number,
      } | null = {
        x: 1,
        y: 2,
      };
      const t: ValueTypeOf<typeof nullableRecordCoordinateTypeDef> = expected;
      expected = t;
      expect(t).toBeDefined();
    });
  });

  describe('list', function () {
    it('has the expected shape', function () {
      let expected: number[] = [
        1,
        2,
        3,
      ];
      const t: ValueTypeOf<typeof listTypeDef> = expected;
      // test assignment in both directions
      expected = t;
      expect(t).toBeDefined();
    });
  });

  describe('record', function () {
    it('has the expected shape', function () {
      let expected: {
        list?: number[],
        literal?: number,
      } = {
        list: [
          1,
          2,
          3,
        ],
        literal: 1,
      };
      const t: ValueTypeOf<typeof recordTypeDef> = expected;
      // test assignment in both directions
      expected = t;
      expect(t).toBeDefined();
    });
  });

  describe('discriminating union', function () {
    it('has the expected shape for discriminator a', function () {
      let expected: {
        readonly disc: 'a',
        list?: number[],
        literal?: number,
      } = {
        disc: 'a',
        list: [
          1,
          2,
          3,
        ],
        literal: 1,
      };
      const t: ValueTypeOf<typeof discriminatingUnionTypeDef> = expected;
      // test assignment in both directions
      // unfortunately typescript allows records with readonly fields to be assigned to
      // variables of the otherwise same type with mutable fields
      expected = t;
      expect(t).toBeDefined();
    });

    it('has the expected shape for discriminator b', function () {
      let expected: {
        readonly disc: 'b',
        readonly x: number,
        readonly y: number,
      } = {
        disc: 'b',
        x: 1,
        y: 2,
      };
      const t: ValueTypeOf<typeof discriminatingUnionTypeDef> = expected;
      // test assignment in both directions
      expected = t;
      expect(t).toBeDefined();
    });
  });
});
