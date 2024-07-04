import { instantiateCopy } from 'base/type/instantiators/copy';
import { readonlyOf } from 'base/type/readonly_of';
import { literalNumericTypeDef } from 'base/type/test/types';

describe('freeze', function () {
  describe('literal', function () {
    let value: number;
    const input = 1;

    beforeEach(function () {
      value = instantiateCopy(readonlyOf(literalNumericTypeDef), input);
    });

    it('passes the value', function () {
      expect(value).toBe(input);
    });
  });
});
