import styled from '@emotion/styled';
import { type PropsWithChildren } from 'react';
import { useMetrics } from 'ui/metrics';

export type FrameProps = PropsWithChildren<{
  gap: number,
} | {
  gap?: undefined,
  xGap: number,
  yGap: number,
}>;

const InternalFrame = styled.div<{ xGap: number, yGap: number }>`
  padding: ${({
  xGap,
  yGap,
}) => `${yGap}px ${xGap}px`};
  label: frame;
  box-sizing: border-box;
  flex: 1;
`;

export function Frame(props: FrameProps) {
  const {
    gap,
    children,
  } = props;
  const { gridBaseline } = useMetrics();

  const [
    xGap,
    yGap,
  ] = gap != null
    ? [
      gap,
      gap,
    ]
    : [
      props.xGap,
      props.yGap,
    ];
  return (
    <InternalFrame
      xGap={xGap * gridBaseline}
      yGap={yGap * gridBaseline}
    >
      {children}
    </InternalFrame>
  );
}
