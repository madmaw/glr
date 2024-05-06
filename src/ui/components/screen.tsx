import styled from '@emotion/styled';
import { type PropsWithChildren } from 'react';
import { UnstyledButton } from 'ui/components/button/unstyled';
import { Column } from 'ui/components/layout';
import { Text } from 'ui/components/text';
import { Typography } from 'ui/typography';

export type ScreenProps = PropsWithChildren<{
  title: string,
  requestBack?: () => void,
}>;

const ScreenContainer = styled(Column)`
  width: 100%;
  height: 100%;
`;

const BodyContainer = styled.div`
  position: relative;
  flex: 1;
`;

export function Screen({
  children,
  title,
  requestBack,
}: ScreenProps) {
  return (
    <ScreenContainer>
      {requestBack
        ? (
          <UnstyledButton onClick={requestBack}>
            <Text type={Typography.Heading}>
              {/* TODO back icon */}
              &lt;
              {title}
            </Text>
          </UnstyledButton>
        )
        : (
          <Text type={Typography.Heading}>
            {title}
          </Text>
        )}
      <BodyContainer>
        {children}
      </BodyContainer>
    </ScreenContainer>
  );
}
