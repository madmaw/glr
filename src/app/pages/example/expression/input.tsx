import styled from '@emotion/styled';
import { t } from '@lingui/macro';
import {
  type ChangeEvent,
  type ForwardedRef,
  forwardRef,
  type KeyboardEvent,
  useCallback,
} from 'react';
import { BasicButton } from 'ui/components/button/basic';
import { Input } from 'ui/components/form/input';
import { Row } from 'ui/components/layout';

export function MSG_INPUT_PLACEHOLDER() {
  return t({
    comment: 'example of a valid mathematical expression',
    message: `example: 1 + 1`,
  });
}

export function MSG_BUTTON_TEXT() {
  return t({
    comment: 'text that appears on the evaluate button',
    message: `Evaluate!`,
  });
}

const InternalInput = styled(Input)`
  flex: 1;
`;

export type ExpressionInputProps = {
  expression: string,
  disabled: boolean,
  onChangeExpression: (expression: string) => void,
  onEvaluateExpression: () => void,
};

export const ExpressionInput = forwardRef(function (
  {
    expression,
    disabled,
    onChangeExpression,
    onEvaluateExpression,
  }: ExpressionInputProps,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const _onChangeExpression = useCallback(function (e: ChangeEvent<HTMLInputElement>) {
    onChangeExpression(e.target.value);
  }, [onChangeExpression]);

  const onEnter = useCallback(function (e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      onEvaluateExpression();
    }
  }, [onEvaluateExpression]);

  return (
    <Row gap={1}>
      <InternalInput
        ref={ref}
        value={expression}
        disabled={disabled}
        onChange={_onChangeExpression}
        onKeyDown={onEnter}
        placeholder={MSG_INPUT_PLACEHOLDER()}
      />
      <BasicButton onClick={onEvaluateExpression}>
        <MSG_BUTTON_TEXT />
      </BasicButton>
    </Row>
  );
});
