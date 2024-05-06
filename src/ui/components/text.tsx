import styled from '@emotion/styled';
import { Alignment } from 'ui/alignment';
import { createTypographic } from './internal/typographic';

export const Text = createTypographic(styled.span<{ alignment?: Alignment }>`
  text-align: ${({ alignment = Alignment.Start }) => alignment};
`);
