import styled from '@emotion/styled';
import type Color from 'colorjs.io';
import { useMetrics } from 'ui/metrics';
import { useTheme } from 'ui/theme';

const Container = styled.div<{
  rounding: number,
  backgroundColor: Color,
  minWidthInternal?: number,
  minHeightInternal?: number,
}>`
  label: placeholder;
  border-radius: ${({ rounding }) => rounding}px;
  background-color: ${({ backgroundColor }) =>
  backgroundColor.toString({
    format: 'hex',
  })};
  min-width: ${({ minWidthInternal }) => minWidthInternal != null ? `${minWidthInternal}px` : undefined};
  min-height: ${({ minHeightInternal }) => minHeightInternal != null ? `${minHeightInternal}px` : undefined};
  flex: 1;
`;

export type PlaceholderProps = {
  minWidth?: number,
  minHeight?: number,
};

export function Placeholder({
  minWidth,
  minHeight,
}: PlaceholderProps) {
  const metrics = useMetrics();
  const theme = useTheme();
  return (
    <Container
      backgroundColor={theme.foreground}
      rounding={metrics.borderRadius}
      minWidthInternal={minWidth != null ? minWidth * metrics.gridBaseline : undefined}
      minHeightInternal={minHeight != null ? minHeight * metrics.gridBaseline : undefined}
    />
  );
}
