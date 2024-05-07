import { ExpressionOutput } from 'app/pages/example/expression/output';
import { render } from 'app/pages/example/testing/react';
import { type Result } from 'app/services/expression';

suite('ExpressionOutput', function () {
  describe.each<[string, Result]>([
    [
      'number',
      {
        type: 'number',
        value: 12,
      },
    ],
    [
      'string',
      {
        type: 'string',
        value: 'asdf',
      },
    ],
    [
      'boolean',
      {
        type: 'boolean',
        value: true,
      },
    ],
    [
      'unexpected result type',
      {
        type: 'unexpected_result',
        resultType: 'a cat',
      },
    ],
    [
      'bad expression',
      {
        type: 'bad_expression',
        expression: 'asdf',
      },
    ],
  ])('%s', function (_, result) {
    test('renders', function () {
      const { container } = render(<ExpressionOutput result={result} />);
      expect(container).toMatchSnapshot();
    });
  });
});
