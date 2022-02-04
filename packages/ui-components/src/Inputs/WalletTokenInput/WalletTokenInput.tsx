import { useWebContext } from '@webb-dapp/react-environment';
import { Currency } from '@webb-dapp/react-environment/webb-context/currency/currency';
import React, { useEffect, useMemo } from 'react';
import styled from 'styled-components';

import { InputLabel } from '../InputLabel/InputLabel';
import { InputSection } from '../InputSection/InputSection';
import { TokenInput } from '../TokenInput/TokenInput';
import { WalletSelect } from '../WalletSelect/WalletSelect';

const WalletTokenInputWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  width: 100%;
`;

type WalletTokenInputProps = {
  setSelectedToken(token: Currency): void;
  selectedToken: Currency | undefined;
};

export const WalletTokenInput: React.FC<WalletTokenInputProps> = ({ selectedToken, setSelectedToken }) => {
  const { activeChain, activeWallet } = useWebContext();
  const allCurrencies = useMemo(() => {
    return activeChain?.nativeCurrencyId ? [Currency.fromCurrencyId(activeChain.nativeCurrencyId)] : [];
  }, [activeChain]);
  const active = useMemo(() => selectedToken ?? allCurrencies[0], [allCurrencies, selectedToken]);

  return (
    <InputSection>
      <WalletTokenInputWrapper>
        <div style={{ flexGrow: 2 }}>
          <InputLabel label={'Select Wallet'}>
            <WalletSelect />
          </InputLabel>
        </div>
        <div style={{ flexShrink: 1 }}>

        </div>
        <div style={{ flexGrow: 2 }}>
          {activeWallet && (
            <InputLabel label={'Select Token'}>
              <TokenInput currencies={allCurrencies} value={active} onChange={setSelectedToken} />
            </InputLabel>
          )}
        </div>
      </WalletTokenInputWrapper>
    </InputSection>
  );
};
