import { type ComponentType } from 'react';
import { Alignment } from 'ui/alignment';
import { Aligner } from 'ui/components/aligner';
import { Frame } from 'ui/components/frame';
import { Scroller } from 'ui/components/scroller';

export type SkeletonProps = {
  Content: ComponentType,
};

export function Skeleton({
  Content,
}: SkeletonProps) {
  return (
    <Scroller overflow='auto'>
      <Aligner
        xAlignment={Alignment.Middle}
        yAlignment={Alignment.Middle}
      >
        <Frame gap={1}>
          <Content />
        </Frame>
      </Aligner>
    </Scroller>
  );
}
