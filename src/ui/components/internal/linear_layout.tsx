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

export type Size = 'expand' | number;

export type LinearLayoutProps = PropsWithChildren<{
  direction: Direction,
  alignment?: Alignment,
  crossAlignment?: Alignment,
  gap?: 0 | 1,
  size?: Size,
}>;

// change the name of the reserved words (add 'Internal' postfix)
type ContainerProps = {
  directionInternal: Direction,
  alignmentInternal?: Alignment,
  crossAlignment?: Alignment,
  sizeInternal: Size | undefined,
  gap: number,
};

const Container = styled.div<ContainerProps>`
  label: ${({ directionInternal }) => directionInternal};
  display: flex;
  flex-direction: ${({ directionInternal }) => directionInternal};
  justify-content: ${({ alignmentInternal }) => alignmentInternal};
  align-items: ${({ crossAlignment }) => crossAlignment};
  gap: ${({ gap }) => gap}px;
  flex-grow: ${({ sizeInternal }) => sizeInternal === 'expand' ? 1 : 0};
  flex-shrink: ${({ sizeInternal }) => sizeInternal === 'expand' ? 1 : 0};
  flex-basis: ${({ sizeInternal }) =>
  sizeInternal == null ? 'fit-content' : sizeInternal === 'expand' ? 'min-content' : `${sizeInternal}px`};
`;

export function LinearLayout(props:
  & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
  & LinearLayoutProps)
{
  const {
    direction,
    alignment,
    size,
    ...remainingProps
  } = props;
  const metrics = useMetrics();
  return (
    <Container
      {...remainingProps}
      directionInternal={direction}
      alignmentInternal={alignment}
      sizeInternal={size === 'expand' || size == null ? size : size * metrics.gridBaseline}
      gap={(props.gap ?? 0) * metrics.gridBaseline}
    />
  );
}
