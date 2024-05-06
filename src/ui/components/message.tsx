import { Alignment } from 'ui/alignment';
import { Typography } from 'ui/typography';
import { type Icon } from './icon/icons';
import { Row } from './layout';
import { Text } from './text';

export type MessageProps = {
  Icon?: Icon,
  message?: string,
};

export function Message({
  Icon,
  message,
}: MessageProps) {
  return (
    <Row
      gap={1}
    >
      {Icon && <Icon type={Typography.Body} />}
      {message && (
        <Text
          alignment={Alignment.Start}
          type={Typography.Body}
        >
          {message}
        </Text>
      )}
    </Row>
  );
}
