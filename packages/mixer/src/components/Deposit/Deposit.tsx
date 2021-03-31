import { SpaceBox } from '@webb-dapp/ui-components/Box';
import { MixerGroupSelect } from '@webb-dapp/ui-components/Inputs/MixerGroupSelect/MixerGroupSelect';
import { WalletTokenInput } from '@webb-dapp/ui-components/Inputs/WalletTokenInput/WalletTokenInput';
import React from 'react';
import styled from 'styled-components';

import { MixerButton } from '../MixerButton/MixerButton';

const DepositWrapper = styled.div``;
type DepositProps = {};

export const Deposit: React.FC<DepositProps> = ({ children }) => {
  return (
    <DepositWrapper>
      <WalletTokenInput />
      <SpaceBox height={16} />
      <MixerGroupSelect />
      <SpaceBox height={16} />
      <MixerButton label={'Deposit'} />
    </DepositWrapper>
  );
};
