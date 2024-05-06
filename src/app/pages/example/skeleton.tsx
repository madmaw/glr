import { Frame } from 'ui/components/frame';
import { Column } from 'ui/components/layout';

export type SkeletonProps = {
  Input: React.ComponentType,
  Output: React.ComponentType,
};

export function Skeleton({
  Input,
  Output,
}: SkeletonProps) {
  return (
    <Frame gap={2}>
      <Column gap={1}>
        <Input />
        <Output />
      </Column>
    </Frame>
  );
}
