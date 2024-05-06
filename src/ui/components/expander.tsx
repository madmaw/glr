import styled from '@emotion/styled';
import {
  Children,
  type PropsWithChildren,
} from 'react';

const ExpanderContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const ChildContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
`;

export function Expander({ children }: PropsWithChildren) {
  return (
    <ExpanderContainer>
      {Children.map(children, function (child) {
        return (
          <ChildContainer>
            {child}
          </ChildContainer>
        );
      })}
    </ExpanderContainer>
  );
}
