import styled from '@emotion/styled';
import { type Alignment } from 'ui/alignment';

export const Aligner = styled.div<{ xAlignment: Alignment, yAlignment: Alignment }>`
  label: aligner;
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: ${({ xAlignment }) => xAlignment};
  align-items: ${({ yAlignment }) => yAlignment};
`;
