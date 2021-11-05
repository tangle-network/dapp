import Typography from '@material-ui/core/Typography';
import { SpaceBox } from '@webb-dapp/ui-components';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { Padding } from '@webb-dapp/ui-components/Padding/Padding';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import React from 'react';
import styled, { css } from 'styled-components';

const ContentWrapper = styled.div`
  padding: 1rem;
  ${above.sm`  padding: 2rem;`}
  max-width: 500px;
  margin: auto;
  border-radius: 20px;
  ${({ theme }: { theme: Pallet }) => css`
    background: ${theme.layer1Background};
    border: 1px solid ${theme.borderColor};
    ${theme.type === 'light' ? `box-shadow: 0px 0px 14px rgba(51, 81, 242, 0.11);` : ''}
  `}
  maxHeight: '400px',
  overflow: 'auto',
`;

type GeofencedProps = {};

export const Geofenced: React.FC<GeofencedProps> = () => {
  return (
    <ContentWrapper>
      <div>
        <Typography variant={'h2'}>We are unable to service your jurisdiction</Typography>
      </div>
    </ContentWrapper>
  );
};
