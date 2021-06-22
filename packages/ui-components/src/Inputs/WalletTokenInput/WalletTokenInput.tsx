import { MixerGroupEntriesWrapper } from '@webb-dapp/mixer';
import { Currency } from '@webb-dapp/mixer/utils/currency';
import React, { useMemo } from 'react';
import styled from 'styled-components';

import { InputLabel } from '../InputLabel/InputLabel';
import { TokenInput } from '../TokenInput/TokenInput';
import { WalletSelect } from '../WalletSelect/WalletSelect';

const WalletTokenInputWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
`;
type WalletTokenInputProps = {
  mixerGroupEntriesWrapper: MixerGroupEntriesWrapper;
  setSelectedToken(token: Currency): void;
  selectedToken: Currency | undefined;
};

export const WalletTokenInput: React.FC<WalletTokenInputProps> = ({
  mixerGroupEntriesWrapper,
  selectedToken,
  setSelectedToken,
}) => {
  const allCurrencies = useMemo(() => {
    return mixerGroupEntriesWrapper.currencies;
  }, [mixerGroupEntriesWrapper]);
  const active = useMemo(() => selectedToken ?? allCurrencies[0], [allCurrencies, selectedToken]);
  return (
    <InputLabel label={'Select wallet < token for deposit'}>
      <WalletTokenInputWrapper>
        <WalletSelect />
        <TokenInput currencies={allCurrencies} value={active} onChange={setSelectedToken} />
      </WalletTokenInputWrapper>
    </InputLabel>
  );
};
