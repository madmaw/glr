import styled from '@emotion/styled';
import {
  type ForwardedRef,
  forwardRef,
  type PropsWithChildren,
} from 'react';

const Container = styled.div`
  position: relative;
  flex-grow: 1;
`;

type ScrollOptions = 'auto' | 'scroll';

const Scroll = styled.div<{
  overflowX: ScrollOptions | undefined,
  overflowY: ScrollOptions | undefined,
}>`
  label: overlayer;
  position: absolute;
  display: flex;
  align-items: stretch;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow-x: ${({ overflowX }) => overflowX};
  overflow-y: ${({ overflowY }) => overflowY};
`;

export type ScrollerProps = PropsWithChildren<{
  overflow: ScrollOptions,
  overflowX?: undefined,
  overflowY?: undefined,
} | {
  overflow?: undefined,
  overflowX: ScrollOptions,
  overflowY?: undefined,
} | {
  overflow?: undefined,
  overflowX?: undefined,
  overflowY: ScrollOptions,
}>;

export const Scroller = forwardRef(
  function (
    {
      children,
      overflow,
      overflowX = overflow,
      overflowY = overflow,
    }: ScrollerProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) {
    return (
      <Container>
        <Scroll
          ref={ref}
          overflowX={overflowX}
          overflowY={overflowY}
        >
          {children}
        </Scroll>
      </Container>
    );
  },
);
