import styled from '@emotion/styled';
import { createTypographic } from 'ui/components/internal/typographic';

export const UnstyledButton = createTypographic(styled.button`
  label: unstyled-button;
  border: none;
  padding: 0;
  margin: 0;
  background-color: transparent;
  &:hover:enabled {
    cursor: pointer;
  }
`);
