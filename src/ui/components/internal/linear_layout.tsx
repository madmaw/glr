import styled from '@emotion/styled';
import {
  type DetailedHTMLProps,
  type HTMLAttributes,
  type PropsWithChildren,
} from 'react';
import { type Alignment } from 'ui/alignment';
import { useMetrics } from 'ui/metrics';

export enum Direction {
  Row = 'row',
  Column = 'column',
}

export type LinearLayoutProps = PropsWithChildren<{
  direction: Direction,
  alignment?: Alignment,
  crossAlignment?: Alignment,
  gap?: 0 | 1,
}>;

// change the name of the reserved words
export type InternalLinearLayoutProps = PropsWithChildren<{
  directionInt: Direction,
  alignmentInt?: Alignment,
  crossAlignment?: Alignment,
  gap?: 0 | 1,
}>;

export const _LinearLayout = styled.div<Omit<InternalLinearLayoutProps, 'gap'> & {
  gap: number,
}>`
  display: flex;
  flex-direction: ${({ directionInt }) => directionInt};
  justify-content: ${({ alignmentInt }) => alignmentInt};
  align-items: ${({ crossAlignment }) => crossAlignment};
  gap: ${({ gap }) => gap}px;
`;

export function LinearLayout(props:
  & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
  & LinearLayoutProps)
{
  const {
    direction,
    alignment,
  } = props;
  const metrics = useMetrics();
  return (
    <_LinearLayout
      {...props}
      directionInt={direction}
      alignmentInt={alignment}
      gap={(props.gap ?? 0) * metrics.gridBaseline}
    />
  );
}
