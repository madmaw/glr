import styled from '@emotion/styled';
import {
  t,
  Trans,
} from '@lingui/macro';
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

const _Input = styled(Input)`
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
  ref: ForwardedRef<typeof _Input>,
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
      <_Input
        ref={ref}
        value={expression}
        disabled={disabled}
        onChange={_onChangeExpression}
        onKeyDown={onEnter}
        placeholder={t`ex. 1 + 1`}
      />
      <BasicButton onClick={onEvaluateExpression}>
        <Trans id='msg.evaluate'>
          Evaluate
        </Trans>
      </BasicButton>
    </Row>
  );
});
