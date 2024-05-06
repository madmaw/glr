import styled from '@emotion/styled';
import type Color from 'colorjs.io';
import {
  type ComponentType,
  type ForwardedRef,
  forwardRef,
  type PropsWithChildren,
} from 'react';
import { useMetrics } from 'ui/metrics';
import { useTheme } from 'ui/theme';

export type BorderedProps = PropsWithChildren<{
  borderRadius: number,
  borderWidth: number,
  borderColor: Color,
}>;

export function createBordered<T, P>(C: ComponentType<P>) {
  const Styled = styled(C)<BorderedProps>`
    label: bordered;
    border-radius: ${({ borderRadius }) => borderRadius}px;
    border-width: ${({ borderWidth }) => borderWidth}px;
    border-color: ${({ borderColor }) => borderColor.toString({ format: 'hex' })};
  `;

  return forwardRef<T, P>(
    function (props: P, ref: ForwardedRef<T>) {
      const {
        borderRadius,
        borderWidth,
      } = useMetrics();
      const {
        foreground,
      } = useTheme();

      return (
        <Styled
          ref={ref}
          {...props}
          borderColor={foreground}
          borderWidth={borderWidth}
          borderRadius={borderRadius}
        />
      );
    },
  );
}
