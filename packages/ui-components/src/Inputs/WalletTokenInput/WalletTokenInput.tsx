import { useWebContext } from '@webb-dapp/react-environment';
import { Currency } from '@webb-dapp/react-environment/types/currency';
import React, { useMemo } from 'react';
import styled from 'styled-components';

import { InputSection } from '../InputSection/InputSection';
import { InputLabel } from '../InputLabel/InputLabel';
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
    return activeChain?.currencies.map(({ currencyId }) => Currency.fromCurrencyId(currencyId)) ?? [];
  }, [activeChain]);
  const active = useMemo(() => selectedToken ?? allCurrencies[0], [allCurrencies, selectedToken]);
  return (
    <InputSection>
      <WalletTokenInputWrapper>
        <InputLabel label={'Select Wallet'}>
          <WalletSelect />
        </InputLabel>

        {activeWallet && (
          <InputLabel label={'Select Token'}>
            {/* used for positioning the token input label */}
            <div style={{ height: '52px' }}></div>
            <TokenInput currencies={allCurrencies} value={active} onChange={setSelectedToken} />
          </InputLabel>
        )}
      </WalletTokenInputWrapper>
    </InputSection>
  );
};
