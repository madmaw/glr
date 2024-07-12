import {
  becomeMobxObservable,
  instantiateMobxObservable,
  type MobxValueTypeOf,
} from 'base/type/instantiators/mobx';
import { type ReadonlyOf } from 'base/type/readonly_of';
import {
  discriminatingUnionTypeDef,
  listTypeDef,
  literalComplexTypeDef,
  literalNumericTypeDef,
  mapTypeDef,
  structuredTypeDef,
} from 'base/type/test/types';
import { type ValueTypeOf } from 'base/type/value_type_of';
import {
  type IReactionDisposer,
  reaction,
  runInAction,
} from 'mobx';
import { expectEquals } from 'testing/helpers';

describe('instantiateMobxObservable', function () {
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

  describe('map', function () {
    let map: ValueTypeOf<typeof mapTypeDef>;
    const input: ValueTypeOf<ReadonlyOf<typeof mapTypeDef>> = {
      a: {
        x: 1,
        y: 2,
      },
      b: {
        x: 2,
        y: 3,
      },
    };

    beforeEach(function () {
      map = instantiateMobxObservable(mapTypeDef, input);
    });

    it('instantiates', function () {
      expect(map).toEqual(input);
    });

    describe('observing changes', function () {
      let ax: number;
      let disposer: IReactionDisposer | undefined;

      beforeEach(function () {
        disposer = reaction(
          function () {
            return map.a.x;
          },
          function (x: number) {
            ax = x;
          },
          {
            fireImmediately: true,
          },
        );

        expect(ax).toBe(1);
        runInAction(function () {
          map.a = {
            x: 100,
            y: 101,
          };
        });
      });

      afterEach(function () {
        disposer?.();
      });

      it('updated', function () {
        expect(map.a).toEqual({
          x: 100,
          y: 101,
        });
      });

      it('calls the reaction', function () {
        expect(ax).toBe(100);
      });

      it('does not change the input', function () {
        expect(input.a.x).toBe(1);
      });
    });
  });

  describe('structured', function () {
    let struct: ValueTypeOf<typeof structuredTypeDef>;
    const input: ValueTypeOf<ReadonlyOf<typeof structuredTypeDef>> = {
      list: [
        1,
        2,
        3,
      ],
      literal: 1,
    };

    beforeEach(function () {
      struct = instantiateMobxObservable(structuredTypeDef, input);
    });

    it('instantiates', function () {
      expect(struct).toEqual(input);
    });

    describe('observing direct changes', function () {
      let literalField: number | undefined;
      let disposer: IReactionDisposer | undefined;

      beforeEach(function () {
        disposer = reaction(
          function () {
            return struct.literal;
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
          struct.literal = 2;
        });
      });

      afterEach(function () {
        disposer?.();
      });

      it('calls the reaction', function () {
        expect(literalField).toBe(2);
      });

      it('updates the literal field', function () {
        expect(struct).toEqual({
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
            return struct.list?.length;
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
          struct.list?.push(4);
        });
      });

      afterEach(function () {
        disposer?.();
      });

      it('calls the reaction', function () {
        expect(listFieldLength).toBe(4);
      });

      it('updates the list field', function () {
        expect(struct).toEqual({
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
          struct.list = list;
        });
        expect(listFieldLength).toBe(1);
        expect(struct).toEqual({
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

describe('becomeMobxObservable', function () {
  describe('list', function () {
    let list: MobxValueTypeOf<typeof listTypeDef>;
    let length: number;
    let disposer: IReactionDisposer;

    beforeEach(function () {
      list = instantiateMobxObservable(listTypeDef, []);
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
      expect(length).toBe(0);
    });

    afterEach(function () {
      disposer();
    });

    it('causes a reaction', function () {
      runInAction(function () {
        const result = becomeMobxObservable(listTypeDef, list, [1]);
        expect(result).toBe(list);
      });
      expect(list).toEqual([1]);
      expect(length).toBe(1);
    });
  });
});
