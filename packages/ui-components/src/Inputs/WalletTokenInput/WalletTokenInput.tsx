import React from 'react';
import styled from 'styled-components';

import { WalletSelect } from '../WalletSelect/WalletSelect';
import { InputLabel } from '../InputLabel/InputLabel';
import { TokenInput } from '../TokenInput/TokenInput';

const WalletTokenInputWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
type WalletTokenInputProps = {};

export const WalletTokenInput: React.FC<WalletTokenInputProps> = ({}) => {
  return (
    <InputLabel label={'Select wallet < token for deposit'}>
      <WalletTokenInputWrapper>
        <WalletSelect />
        <TokenInput />
      </WalletTokenInputWrapper>
    </InputLabel>
  );
};
