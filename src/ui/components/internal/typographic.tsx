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

// 'Int' postfix prevents the prop from being rendered as an attribute on the underlying HTML
// as some of these props are also valid HTML attributes
export type StyledTextProps = PropsWithChildren<{
  fontFamilyInt: string,
  fontSizeInt: number,
  fontStyleInt: FontStyle,
  fontWeightInt: FontWeight,
  lineHeight: number,
  foreground: Color,
}>;

export function createTypographic<T, P>(C: ComponentType<P>) {
  const Styled = styled(C)<StyledTextProps>`
    label: typographic;
    font-family: ${({ fontFamilyInt }) => fontFamilyInt};
    font-size: ${({ fontSizeInt }) => fontSizeInt}px;
    font-style: ${({ fontStyleInt }) => fontStyleInt};
    font-weight: ${({ fontWeightInt }) => fontWeightInt};
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
          fontFamilyInt={fontFamily}
          fontSizeInt={fontSize}
          lineHeight={lineHeight}
          fontStyleInt={fontStyle}
          fontWeightInt={fontWeight}
        />
      );
    },
  );
}
