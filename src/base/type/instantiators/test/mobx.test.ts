import { instantiateMobxObservable } from 'base/type/instantiators/mobx';
import { type ReadonlyOf } from 'base/type/readonly_of';
import {
  discriminatingUnionTypeDef,
  listTypeDef,
  literalComplexTypeDef,
  literalNumericTypeDef,
  recordTypeDef,
} from 'base/type/test/types';
import { type ValueTypeOf } from 'base/type/value_type_of';
import {
  type IReactionDisposer,
  reaction,
  runInAction,
} from 'mobx';
import { expectEquals } from 'testing/helpers';

describe('mobx', function () {
  describe('literal numeric value', function () {
    let literal: number;
    const input = 1;

    beforeEach(function () {
      literal = instantiateMobxObservable(literalNumericTypeDef, input);
    });

    it('instantiates', function () {
      expect(literal).toBe(input);
    });

    it('is of same type', function () {
      expect(literal === input).toBeDefined();
      expect(typeof literal).toBe('number');
    });
  });

  describe('literal complex value', function () {
    let literal: ValueTypeOf<typeof literalComplexTypeDef>;
    const input: ValueTypeOf<ReadonlyOf<typeof literalComplexTypeDef>> = {
      a: 'hello',
    };

    beforeEach(function () {
      literal = instantiateMobxObservable(literalComplexTypeDef, input);
    });

    it('instantiates', function () {
      expect(literal).toEqual(input);
    });

    describe('observing', function () {
      let value: string;
      let disposer: IReactionDisposer | undefined;

      beforeEach(function () {
        value = literal.a;
        disposer = reaction(
          function () {
            return literal.a;
          },
          function (a: string) {
            value = a;
          },
        );
      });

      afterEach(function () {
        disposer?.();
      });

      it('is not observable', function () {
        runInAction(function () {
          literal.a = 'goodbye';
        });
        expect(value).toBe('hello');
        expect(literal.a).toBe('goodbye');
      });
    });
  });

  describe('list of numbers', function () {
    let list: number[];
    const input: readonly number[] = [
      1,
      2,
      3,
      4,
      5,
    ];

    beforeEach(function () {
      list = instantiateMobxObservable(listTypeDef, input);
    });

    it('instantiates', function () {
      expect(list).toEqual(input);
    });

    describe('observing changes', function () {
      let length: number;
      let disposer: IReactionDisposer | undefined;

      beforeEach(function () {
        disposer = reaction(
          function () {
            return list.length;
          },
          function (newLength: number) {
            length = newLength;
          },
          {
            fireImmediately: true,
          },
        );
        expect(length).toBe(5);
        runInAction(function () {
          list.push(6);
        });
      });

      afterEach(function () {
        disposer?.();
      });

      it('calls the reaction', function () {
        expect(length).toBe(6);
      });

      it('updates the new value', function () {
        expect(list).toEqual([
          1,
          2,
          3,
          4,
          5,
          6,
        ]);
      });

      it('leaves the input alone', function () {
        expect(input).toEqual([
          1,
          2,
          3,
          4,
          5,
        ]);
      });
    });
  });

  describe('record', function () {
    let record: ValueTypeOf<typeof recordTypeDef>;
    const input: ValueTypeOf<ReadonlyOf<typeof recordTypeDef>> = {
      list: [
        1,
        2,
        3,
      ],
      literal: 1,
    };

    beforeEach(function () {
      record = instantiateMobxObservable(recordTypeDef, input);
    });

    it('instantiates', function () {
      expect(record).toEqual(input);
    });

    describe('observing direct changes', function () {
      let literalField: number | undefined;
      let disposer: IReactionDisposer | undefined;

      beforeEach(function () {
        disposer = reaction(
          function () {
            return record.literal;
          },
          function (newLiteral: number | undefined) {
            literalField = newLiteral;
          },
          {
            fireImmediately: true,
          },
        );
        expect(literalField).toBe(1);
        runInAction(function () {
          record.literal = 2;
        });
      });

      afterEach(function () {
        disposer?.();
      });

      it('calls the reaction', function () {
        expect(literalField).toBe(2);
      });

      it('updates the literal field', function () {
        expect(record).toEqual({
          list: [
            1,
            2,
            3,
          ],
          literal: 2,
        });
      });
    });

    describe('observing indirect changes', function () {
      let listFieldLength: number | undefined;
      let disposer: IReactionDisposer | undefined;

      beforeEach(function () {
        disposer = reaction(
          function () {
            return record.list?.length;
          },
          function (newLength: number | undefined) {
            listFieldLength = newLength;
          },
          {
            fireImmediately: true,
          },
        );
        expect(listFieldLength).toBe(3);
        runInAction(function () {
          record.list?.push(4);
        });
      });

      afterEach(function () {
        disposer?.();
      });

      it('calls the reaction', function () {
        expect(listFieldLength).toBe(4);
      });

      it('updates the list field', function () {
        expect(record).toEqual({
          list: [
            1,
            2,
            3,
            4,
          ],
          literal: 1,
        });
      });

      it('reports reassignment of the field', function () {
        const list = instantiateMobxObservable(listTypeDef, [1]);
        runInAction(function () {
          record.list = list;
        });
        expect(listFieldLength).toBe(1);
        expect(record).toEqual({
          list: [1],
          literal: 1,
        });
      });
    });
  });

  describe('discriminating union', function () {
    let discriminatingUnion: ValueTypeOf<typeof discriminatingUnionTypeDef>;
    const input: ValueTypeOf<ReadonlyOf<typeof discriminatingUnionTypeDef>> = {
      disc: 'a',
      list: [],
      literal: 1,
    };

    beforeEach(function () {
      discriminatingUnion = instantiateMobxObservable(
        discriminatingUnionTypeDef,
        input,
      );
    });

    it('instantiates', function () {
      expect(discriminatingUnion).toEqual(input);
    });

    describe('observing indirect changes', function () {
      let value: number | undefined;
      let disposer: IReactionDisposer | undefined;

      beforeEach(function () {
        disposer = reaction(
          function () {
            return discriminatingUnion.disc === 'a'
              ? discriminatingUnion.list?.length
              : undefined;
          },
          function (newValue: number | undefined) {
            value = newValue;
          },
          {
            fireImmediately: true,
          },
        );
        expect(value).toBe(0);
        runInAction(function () {
          expectEquals(discriminatingUnion.disc, 'a');
          discriminatingUnion.list?.push(1);
        });
      });

      afterEach(function () {
        disposer?.();
      });

      it('calls the reaction', function () {
        expect(value).toBe(1);
      });

      it('updates the list field', function () {
        expect(discriminatingUnion).toEqual({
          disc: 'a',
          list: [1],
          literal: 1,
        });
      });
    });
  });
});
