import styled from '@emotion/styled';
import {
  type DetailedHTMLProps,
  type ForwardedRef,
  forwardRef,
  type InputHTMLAttributes,
} from 'react';
import { createBordered } from 'ui/components/internal/bordered';
import { createTypographic } from 'ui/components/internal/typographic';

type InputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

const SI = styled.input`
min-width: 0;
`;

const StyledInput = createBordered(SI);

const ThemedInput = forwardRef<HTMLInputElement, InputProps>(
  function (props: InputProps, ref: ForwardedRef<HTMLInputElement>) {
    return (
      <StyledInput
        ref={ref}
        {...props}
      />
    );
  },
);

export const Input = createTypographic(ThemedInput);
