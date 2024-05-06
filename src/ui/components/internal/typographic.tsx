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
import {
  type FontStyle,
  type FontWeight,
  Typography,
} from 'ui/typography';

export type StyledTextProps = PropsWithChildren<{
  fontFamily: string,
  fontSize: number,
  fontStyle: FontStyle,
  fontWeight: FontWeight,
  lineHeight: number,
  foreground: Color,
}>;

export function createTypographic<T, P>(C: ComponentType<P>) {
  const Styled = styled(C)<StyledTextProps>`
    label: typographic;
    font-family: ${({ fontFamily }) => fontFamily};
    font-size: ${({ fontSize }) => fontSize}px;
    font-style: ${({ fontStyle }) => fontStyle};
    font-weight: ${({ fontWeight }) => fontWeight};
    line-height: ${({ lineHeight }) => lineHeight}px;
    color: ${({ foreground }) => foreground.toString()};
  `;

  return forwardRef<T, P & { type?: Typography }>(
    function (props: P & { type?: Typography }, ref: ForwardedRef<T>) {
      const type = props.type ?? Typography.Body;
      const {
        typography: metricsTypography,
      } = useMetrics();
      const {
        fontSize,
        lineHeight,
      } = metricsTypography[type];
      const {
        foreground,
        typography: themeTypography,
      } = useTheme();
      const {
        fontFamily,
        fontStyle,
        fontWeight,
      } = themeTypography[type];

      return (
        <Styled
          ref={ref}
          {...props}
          foreground={foreground}
          fontFamily={fontFamily}
          fontSize={fontSize}
          lineHeight={lineHeight}
          fontStyle={fontStyle}
          fontWeight={fontWeight}
        />
      );
    },
  );
}
