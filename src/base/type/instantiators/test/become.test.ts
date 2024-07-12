import { type TypeDef } from 'base/type/definition';
import { become } from 'base/type/instantiators/become';
import { type ReadonlyOf } from 'base/type/readonly_of';
import {
  discriminatingUnionTypeDef,
  listTypeDef,
  literalComplexTypeDef,
  literalNumericTypeDef,
  structuredTypeDef,
} from 'base/type/test/types';
import { type ValueTypeOf } from 'base/type/value_type_of';

describe('become', function () {
  let instantiator: <T extends TypeDef>(t: T, v: ValueTypeOf<ReadonlyOf<T>>) => ValueTypeOf<T>;
  beforeEach(function () {
    // always just return the supplied value
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    instantiator = vitest.fn(function<T extends TypeDef> (_t: T, v: ValueTypeOf<ReadonlyOf<T>>) {
      return v;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;
  });

  describe('literal', function () {
    it('becomes the new value', function () {
      const input = 1;
      const prototype = 2;
      const result = become(literalNumericTypeDef, instantiator, input, prototype);
      expect(instantiator).not.toHaveBeenCalled();
      expect(result).toBe(prototype);
    });

    it('does not attempt to copy complex values', function () {
      const input: ValueTypeOf<typeof literalComplexTypeDef> = {
        a: 'hello',
      };
      const prototype: ValueTypeOf<typeof literalComplexTypeDef> = {
        a: 'goodbye',
      };
      const result = become(literalComplexTypeDef, instantiator, input, prototype);
      expect(instantiator).not.toHaveBeenCalled();
      expect(result).toBe(prototype);
    });
  });

  describe('list', function () {
    it('does not change anything if the values are the same', function () {
      const list: ValueTypeOf<typeof listTypeDef> = [
        1,
        2,
        3,
      ];
      const prototype = Object.freeze([...list]);
      const result = become(listTypeDef, instantiator, list, prototype);
      expect(result).toBe(list);
      expect(result).toEqual(prototype);
    });

    it('adds the missing values', function () {
      const list: ValueTypeOf<typeof listTypeDef> = [
        1,
        2,
      ];
      const prototype: ValueTypeOf<ReadonlyOf<typeof listTypeDef>> = Object.freeze([
        1,
        2,
        3,
      ]);
      const result = become(listTypeDef, instantiator, list, prototype);
      expect(result).toBe(list);
      expect(result).toEqual(prototype);
      expect(instantiator).toHaveBeenCalledTimes(1);
    });

    it('removes the additional values', function () {
      const list: ValueTypeOf<typeof listTypeDef> = [
        1,
        2,
        3,
      ];
      const prototype: ValueTypeOf<ReadonlyOf<typeof listTypeDef>> = Object.freeze([
        1,
        2,
      ]);
      const result = become(listTypeDef, instantiator, list, prototype);
      expect(result).toBe(list);
      expect(result).toEqual(prototype);
      expect(instantiator).not.toHaveBeenCalled();
    });

    it('replaces differing values', function () {
      const list: ValueTypeOf<typeof listTypeDef> = [
        1,
        2,
      ];
      const prototype: ValueTypeOf<ReadonlyOf<typeof listTypeDef>> = Object.freeze([
        3,
        4,
      ]);
      const result = become(listTypeDef, instantiator, list, prototype);
      expect(result).toBe(list);
      expect(result).toEqual(prototype);
      expect(instantiator).not.toBeCalled();
    });

    it('replaces differing values', function () {
      const list: ValueTypeOf<typeof listTypeDef> = [];
      const prototype: ValueTypeOf<ReadonlyOf<typeof listTypeDef>> = Object.freeze([
        1,
        2,
      ]);
      const result = become(listTypeDef, instantiator, list, prototype);
      expect(result).toBe(list);
      expect(result).toEqual(prototype);
      expect(instantiator).toHaveBeenCalledTimes(2);
    });
  });

  describe('structured', function () {
    it('does not change anything if the values are the same', function () {
      const struct: ValueTypeOf<typeof structuredTypeDef> = {
        list: [
          1,
          2,
        ],
        literal: 3,
      };
      const prototype = Object.freeze({ ...struct });
      const result = become(structuredTypeDef, instantiator, struct, prototype);
      expect(result).toBe(struct);
      expect(result).toEqual(prototype);
      expect(instantiator).not.toBeCalled();
    });

    it('adds the missing list', function () {
      const struct: ValueTypeOf<typeof structuredTypeDef> = {
        list: undefined,
        literal: 3,
      };
      const prototype = Object.freeze({
        list: Object.freeze([
          1,
          2,
        ]),
        literal: 3,
      });
      const result = become(structuredTypeDef, instantiator, struct, prototype);
      expect(result).toBe(struct);
      expect(result).toEqual(prototype);
      expect(instantiator).toHaveBeenCalledTimes(1);
      expect(instantiator).toHaveBeenNthCalledWith(1, listTypeDef, [
        1,
        2,
      ]);
    });

    it('adds the missing literal', function () {
      const struct: ValueTypeOf<typeof structuredTypeDef> = {
        list: [
          1,
          2,
        ],
      };
      const prototype = Object.freeze({
        list: Object.freeze([
          1,
          2,
        ]),
        literal: 3,
      });
      const result = become(structuredTypeDef, instantiator, struct, prototype);
      expect(result).toBe(struct);
      expect(result).toEqual(prototype);
      expect(instantiator).toHaveBeenCalledTimes(1);
      expect(instantiator).toHaveBeenNthCalledWith(1, literalNumericTypeDef, 3);
    });

    it('removes the additional list', function () {
      const struct: ValueTypeOf<typeof structuredTypeDef> = {
        list: [
          1,
          2,
        ],
        literal: 3,
      };
      const prototype = Object.freeze({
        literal: 3,
      });
      const result = become(structuredTypeDef, instantiator, struct, prototype);
      expect(result).toBe(struct);
      expect(result).toEqual(prototype);
      expect(instantiator).not.toHaveBeenCalled();
    });

    it('performs the delta on the list property', function () {
      const struct: ValueTypeOf<typeof structuredTypeDef> = {
        list: [],
      };
      const prototype = Object.freeze({
        list: [
          1,
          2,
        ],
      });
      const result = become(structuredTypeDef, instantiator, struct, prototype);
      expect(result).toBe(struct);
      expect(result).toEqual(prototype);
      expect(instantiator).toHaveBeenCalledTimes(2);
      expect(instantiator).toHaveBeenNthCalledWith(1, literalNumericTypeDef, 1);
      expect(instantiator).toHaveBeenNthCalledWith(2, literalNumericTypeDef, 2);
    });
  });

  describe('discriminating union', function () {
    it('does not change anything if the values are the same', function () {
      const value: ValueTypeOf<typeof discriminatingUnionTypeDef> = {
        disc: 'a',
        list: [1],
        literal: 1,
      };
      const prototype = Object.freeze({ ...value });
      const result = become(discriminatingUnionTypeDef, instantiator, value, prototype);
      expect(result).toBe(value);
      expect(result).toEqual(prototype);
      expect(instantiator).not.toHaveBeenCalled();
    });

    it('updates the changed fields', function () {
      const value: ValueTypeOf<typeof discriminatingUnionTypeDef> = {
        disc: 'a',
        list: [
          1,
          2,
        ],
        literal: 3,
      };
      const prototype: ValueTypeOf<ReadonlyOf<typeof discriminatingUnionTypeDef>> = Object.freeze({
        disc: 'a',
        list: [
          4,
          5,
        ],
        literal: 6,
      });
      const result = become(discriminatingUnionTypeDef, instantiator, value, prototype);
      expect(result).toBe(value);
      expect(result).toEqual(prototype);
      expect(instantiator).not.toHaveBeenCalled();
    });

    it('throws away the value if the discriminator is different', function () {
      const value: ValueTypeOf<typeof discriminatingUnionTypeDef> = {
        disc: 'a',
        list: [
          1,
          2,
        ],
        literal: 3,
      };
      const prototype: ValueTypeOf<ReadonlyOf<typeof discriminatingUnionTypeDef>> = Object.freeze({
        disc: 'b',
        x: 4,
        y: 5,
      });
      const result = become(discriminatingUnionTypeDef, instantiator, value, prototype);
      expect(result).not.toBe(value);
      expect(result).toEqual(prototype);
      expect(instantiator).toHaveBeenCalledTimes(1);
      expect(instantiator).toHaveBeenCalledWith(discriminatingUnionTypeDef, prototype);
    });
  });
});
