import {
  type ComponentType,
  useState,
} from 'react';
import { Alignment } from 'ui/alignment';
import { Aligner } from 'ui/components/aligner';
import { Scroller } from 'ui/components/scroller';

export type SkeletonProps = {
  Content: ComponentType<{ scrollContainer: HTMLElement | null }>,
};

export function Skeleton({
  Content,
}: SkeletonProps) {
  const [
    scrollViewRef,
    setScrollViewRef,
  ] = useState<HTMLElement | null>(null);
  return (
    <Scroller
      overflow='auto'
      ref={setScrollViewRef}
    >
      <Aligner
        xAlignment={Alignment.Stretch}
        yAlignment={Alignment.Stretch}
      >
        <Content scrollContainer={scrollViewRef} />
      </Aligner>
    </Scroller>
  );
}
