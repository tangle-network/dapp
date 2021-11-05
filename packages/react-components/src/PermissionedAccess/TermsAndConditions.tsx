import { Button, Divider, Fade, InputBase, MenuItem, Select } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { SpaceBox } from '@webb-dapp/ui-components';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { Padding } from '@webb-dapp/ui-components/Padding/Padding';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import React, { useEffect, useState } from 'react';
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

type TermsAndConditionsProps = {
  acceptTerms: () => void;
};

export const TermsAndConditions: React.FC<TermsAndConditionsProps> = (props) => {
  return (
    <ContentWrapper>
      <div>
        <Typography>
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
          est laborum."
        </Typography>
      </div>
      <SpaceBox height={16} />
      <MixerButton onClick={() => props.acceptTerms()} label={'Accept Terms and Conditions'} />
    </ContentWrapper>
  );
};
