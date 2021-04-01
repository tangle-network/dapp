import React, { useState } from 'react';
import styled from 'styled-components';

import { WalletSelect } from '../WalletSelect/WalletSelect';
import { InputLabel } from '../InputLabel/InputLabel';
import { TokenInput } from '../TokenInput/TokenInput';
import { useConstants } from '@webb-dapp/react-hooks';
import { CurrencyId } from '@webb-tools/types/interfaces';

const WalletTokenInputWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
type WalletTokenInputProps = {};

export const WalletTokenInput: React.FC<WalletTokenInputProps> = ({}) => {
  const { allCurrencies } = useConstants();
  const [active, setActive] = useState<CurrencyId | undefined>(allCurrencies[0]);

  return (
    <InputLabel label={'Select wallet < token for deposit'}>
      <WalletTokenInputWrapper>
        <WalletSelect />
        <TokenInput currencies={allCurrencies} value={active} onChange={setActive} />
      </WalletTokenInputWrapper>
    </InputLabel>
  );
};
