import { useBridge } from '@webb-dapp/bridge/hooks/bridge/use-bridge';
import { useWebContext } from '@webb-dapp/react-environment';
import { BridgeCurrencyIndex } from '@webb-dapp/react-environment/webb-context/bridge/bridge-api';
import { Currency } from '@webb-dapp/react-environment/webb-context/currency/currency';
import React, { useEffect } from 'react';
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
  setSelectedToken(token: BridgeCurrencyIndex | undefined): void;
  selectedToken: Currency | undefined;
};

export const WalletBridgeCurrencyInput: React.FC<WalletTokenInputProps> = ({ selectedToken, setSelectedToken }) => {
  const { activeWallet } = useWebContext();
  const { tokens: allCurrencies } = useBridge();

  useEffect(() => {
    if (!selectedToken && allCurrencies.length) {
      setSelectedToken(allCurrencies[0].id);
      return;
    }
    if (selectedToken) {
      const selectedIsInList = allCurrencies.findIndex((c) => c.id === selectedToken.id) > -1;
      if (!selectedIsInList) {
        allCurrencies[0] ? setSelectedToken(allCurrencies[0].id) : setSelectedToken(undefined);
      }
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
            <TokenInput
              currencies={allCurrencies}
              value={selectedToken}
              onChange={(currencyContent) => {
                if (currencyContent) {
                  // TODO validate the id is BridgeCurrency id not WebbCurrencyId
                  setSelectedToken(currencyContent.view.id);
                } else {
                  setSelectedToken(undefined);
                }
              }}
            />
          </InputLabel>
        )}
      </WalletTokenInputWrapper>
    </InputSection>
  );
};
