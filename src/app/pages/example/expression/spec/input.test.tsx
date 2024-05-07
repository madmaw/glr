import {
  ExpressionInput,
  MSG_BUTTON_TEXT,
  MSG_INPUT_PLACEHOLDER,
} from 'app/pages/example/expression/input';
import {
  createEvent,
  fireEvent,
  render,
} from 'app/pages/example/testing/react';
import { type Mock } from 'vitest';

suite('ExpressionInput', function () {
  let onChangeExpression: Mock<[string], void>;
  let onEvaluateExpression: Mock<[], void>;

  beforeEach(function () {
    onChangeExpression = vitest.fn();
    onEvaluateExpression = vitest.fn();
  });

  describe.each([
    '123',
    '"abc"',
    '',
    '  return',
  ])('with expression %s', function (expression) {
    describe.each([
      true,
      false,
    ])('disabled %s', function (disabled) {
      it('renders', function () {
        const { container } = render(
          (
            <ExpressionInput
              disabled={disabled}
              expression={expression}
              onChangeExpression={onChangeExpression}
              onEvaluateExpression={onEvaluateExpression}
            />
          ),
        );
        expect(container).toMatchSnapshot();
      });
    });
  });

  it('fires on change event', function () {
    const newValue = '2';
    const { getByPlaceholderText } = render(
      (
        <ExpressionInput
          disabled={false}
          expression='1'
          onChangeExpression={onChangeExpression}
          onEvaluateExpression={onEvaluateExpression}
        />
      ),
    );
    const input = getByPlaceholderText(MSG_INPUT_PLACEHOLDER());
    expect(input).toBeDefined();
    expect(onChangeExpression).not.toHaveBeenCalled();
    const event = createEvent.change(input, { target: { value: newValue } });
    fireEvent(input, event);
    expect(onChangeExpression).toHaveBeenCalledOnce();
    expect(onChangeExpression).toHaveBeenCalledWith(newValue);
  });

  it('fires evaluate expression event from button', function () {
    const { getByText } = render(
      (
        <ExpressionInput
          disabled={false}
          expression='1'
          onChangeExpression={onChangeExpression}
          onEvaluateExpression={onEvaluateExpression}
        />
      ),
    );
    const button = getByText(MSG_BUTTON_TEXT());
    expect(button).toBeDefined();
    expect(onEvaluateExpression).not.toHaveBeenCalled();
    button.click();
    expect(onEvaluateExpression).toHaveBeenCalledOnce();
  });

  it('fires evaluate expression event from input on enter key', function () {
    // TODO
  });
});
