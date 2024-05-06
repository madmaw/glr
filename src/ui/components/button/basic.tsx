import styled from '@emotion/styled';
import { createBordered } from 'ui/components/internal/bordered';
import { createTypographic } from 'ui/components/internal/typographic';

export const BasicButton = createBordered(createTypographic(styled.button`
`));
