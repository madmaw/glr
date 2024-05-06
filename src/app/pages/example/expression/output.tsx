import {
  t,
  Trans,
} from '@lingui/macro';
import { type Result } from 'app/services/expression';
import { UnreachableError } from 'base/unreachable_error';
import { AlertIcon } from 'ui/components/icon/icons';
import { Message } from 'ui/components/message';
import { Text } from 'ui/components/text';

export type ExpressionOutputProps = {
  result: Result,
};

export function ExpressionOutput({ result }: ExpressionOutputProps) {
  switch (result.type) {
    case 'bad_expression':
      return (
        <Message
          Icon={AlertIcon}
          message={t`Invalid Expression`}
        >
        </Message>
      );
    case 'unexpected_result':
      return (
        <Message
          Icon={AlertIcon}
          message={t`Expression must return a primitive`}
        >
        </Message>
      );
    case 'boolean':
      return (
        <Text>
          <Trans>
            Boolean: {result.value}
          </Trans>
        </Text>
      );
    case 'number':
      return (
        <Text>
          <Trans>
            Number: {result.value}
          </Trans>
        </Text>
      );
    case 'string':
      return (
        <Text>
          <Trans>
            String: {result.value}
          </Trans>
        </Text>
      );
    default:
      throw new UnreachableError(result);
  }
}
