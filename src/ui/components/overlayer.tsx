import styled from '@emotion/styled';
import {
  Children,
  type PropsWithChildren,
} from 'react';

const OverlayerContainer = styled.div`
  position: relative;
  flex: 1;
`;

const ChildContainer = styled.div`
  label: overlayer;
  position: absolute;
  display: flex;
  align-items: stretch;
  width: 100%;
  height: 100%;
`;

export function Overlayer({ children }: PropsWithChildren) {
  return (
    <OverlayerContainer>
      {Children.map(children, function (child) {
        return (
          <ChildContainer>
            {child}
          </ChildContainer>
        );
      })}
    </OverlayerContainer>
  );
}
