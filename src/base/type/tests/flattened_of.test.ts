import {
  type DiscriminatingUnionTypeDef,
  type ListTypeDef,
  type LiteralTypeDef,
  type RecordTypeDef,
  type RecordTypeDefField,
  TypeDefType,
} from 'base/type/definition';
import {
  flatten,
  type FlattenedOf,
} from 'base/type/flattened_of';

const literalNumericTypeDef: LiteralTypeDef<number> = {
  type: TypeDefType.Literal,
  value: undefined!,
};

const listTypeDef: ListTypeDef<typeof literalNumericTypeDef> = {
  type: TypeDefType.List,
  elements: literalNumericTypeDef,
  readonly: false,
};

const recordTypeDef: RecordTypeDef<{
  literal: RecordTypeDefField<typeof literalNumericTypeDef, false, false>,
  list: RecordTypeDefField<typeof listTypeDef, false, false>,
}> = {
  type: TypeDefType.Record,
  fields: {
    literal: {
      valueType: literalNumericTypeDef,
      readonly: false,
      optional: false,
    },
    list: {
      valueType: listTypeDef,
      readonly: false,
      optional: false,
    },
  },
};

const discriminatingUnionTypeDef: DiscriminatingUnionTypeDef<'disc', {
  a: typeof recordTypeDef.fields,
}> = {
  type: TypeDefType.DiscriminatingUnion,
  discriminator: 'disc',
  unions: {
    a: recordTypeDef.fields,
  },
};

const discriminatingUnionDiscriminatorTypeDef: LiteralTypeDef<'a'> = {
  type: TypeDefType.Literal,
  value: undefined!,
};

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
    const flattened = flatten(literalNumericTypeDef, 'l');
    expect(flattened).toEqual({
      l: literalNumericTypeDef,
    });
  });

  it('produces the expected list', function () {
    const flattened = flatten(listTypeDef, 'l');
    expect(flattened).toEqual({
      l: listTypeDef,
      'l.0': literalNumericTypeDef,
    });
  });

  it('produces the expected record', function () {
    const flattened = flatten(recordTypeDef, 'r');
    expect(flattened).toEqual({
      r: recordTypeDef,
      'r.literal': literalNumericTypeDef,
      'r.list': listTypeDef,
      'r.list.0': literalNumericTypeDef,
    });
  });

  it('produces the expected discriminating union', function () {
    const flattened = flatten(discriminatingUnionTypeDef, 'd');
    expect(flattened).toEqual({
      d: discriminatingUnionTypeDef,
      'd.disc': discriminatingUnionDiscriminatorTypeDef,
      'd.a': recordTypeDef,
      'd.a.list': listTypeDef,
      'd.a.list.0': literalNumericTypeDef,
      'd.a.literal': literalNumericTypeDef,
    });
  });
});
