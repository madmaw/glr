import { type ComponentType } from 'react';
import {
  Column,
  Row,
} from 'ui/components/layout';

export type SkeletonProps = {
  LHSPanel: ComponentType | undefined,
  RHSPanel: ComponentType | undefined,
  Body: ComponentType,
  Header: ComponentType,
  Footer: ComponentType,
};

export function Skeleton({
  Header,
  Footer,
  LHSPanel,
  RHSPanel,
  Body,
}: SkeletonProps) {
  return (
    <Column size='expand'>
      <Row size={6}>
        <Header />
      </Row>
      <Row size='expand'>
        {LHSPanel && (
          <Column size={20}>
            <LHSPanel />
          </Column>
        )}
        <Column size='expand'>
          <Body />
        </Column>
        {RHSPanel && (
          <Column size={20}>
            <RHSPanel />
          </Column>
        )}
      </Row>
      <Row size={4}>
        <Footer />
      </Row>
    </Column>
  );
}
