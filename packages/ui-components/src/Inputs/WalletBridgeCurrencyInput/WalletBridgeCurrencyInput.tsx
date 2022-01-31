import { useBridge } from '@webb-dapp/bridge/hooks/bridge/use-bridge';
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

export const WalletBridgeCurrencyInput: React.FC<WalletTokenInputProps> = ({ selectedToken, setSelectedToken }) => {
  const { activeChain, activeWallet } = useWebContext();
  const { getTokens, getTokensOfChain } = useBridge();
  const allCurrencies = useMemo(() => {
    if (activeChain) {
      return getTokensOfChain(activeChain.id);
    }
    return getTokens();
  }, [activeChain, getTokens, getTokensOfChain]);

  useEffect(() => {
    if (selectedToken) {
      setSelectedToken(selectedToken);
      return;
    }
    if (allCurrencies.length) {
      setSelectedToken(allCurrencies[0]);
      return;
    }
  }, [allCurrencies, selectedToken, setSelectedToken]);

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
            <TokenInput
              currencies={allCurrencies}
              value={selectedToken}
              onChange={(currencyContent) => {
                if (currencyContent) {
                  // TODO validate the id is BridgeCurrency id not WebbCurrencyId
                  setSelectedToken(Currency.fromCurrencyId(currencyContent.view.id));
                }
              }}
            />
          </InputLabel>
        )}
      </WalletTokenInputWrapper>
    </InputSection>
  );
};
