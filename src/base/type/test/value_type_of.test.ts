import { type ValueTypeOf } from 'base/type/value_type_of';
import {
  type discriminatingUnionTypeDef,
  type listTypeDef,
  type literalNumericTypeDef,
  type recordTypeDef,
} from './types';

// we are just testing this file compiles, as we are just producing types there is no code for the tests
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
        list: number[],
        literal: number,
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
        disc: 'a',
        list: number[],
        literal: number,
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
      expected = t;
      expect(t).toBeDefined();
    });

    it('has the expected shape for discriminator b', function () {
      let expected: {
        disc: 'b',
        x: number,
        y: number,
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
