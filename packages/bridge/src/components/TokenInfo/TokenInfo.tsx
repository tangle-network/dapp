import { Avatar, ListItemAvatar, ListItemText, Typography } from '@material-ui/core';
import { ChainId } from '@webb-dapp/apps/configs';
import { chainsPopulated } from '@webb-dapp/apps/configs';
import { DepositConfirm } from '@webb-dapp/bridge/components/DepositConfirm/DepositConfirm';
import { useBridge } from '@webb-dapp/bridge/hooks/bridge/use-bridge';
import { useBridgeDeposit } from '@webb-dapp/bridge/hooks/deposit/useBridgeDeposit';
import { BridgeCurrency, MixerSize, useWebContext } from '@webb-dapp/react-environment/webb-context';
import { SpaceBox } from '@webb-dapp/ui-components/Box';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { ChainInput } from '@webb-dapp/ui-components/Inputs/ChainInput/ChainInput';
import { InputLabel } from '@webb-dapp/ui-components/Inputs/InputLabel/InputLabel';
import { InputSection } from '@webb-dapp/ui-components/Inputs/InputSection/InputSection';
import { MixerGroupSelect } from '@webb-dapp/ui-components/Inputs/MixerGroupSelect/MixerGroupSelect';
import { TokenInput } from '@webb-dapp/ui-components/Inputs/TokenInput/TokenInput';
import {
  fromBridgeCurrencyToCurrencyView,
  WalletBridgeCurrencyInput,
} from '@webb-dapp/ui-components/Inputs/WalletBridgeCurrencyInput/WalletBridgeCurrencyInput';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

const TokenInfoWrapper = styled.div``;
type TokenInfoProps = {};

const ChainName = styled.span`
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;

export const TokenInfo: React.FC<TokenInfoProps> = () => {
  const bridgeDepositApi = useBridgeDeposit();
  const { getTokens, getTokensOfChain } = useBridge();
  const { activeChain, activeWallet, chains, switchChain } = useWebContext();
  // const { clearAmount, token } = useBalanceSelect();
  const { depositApi } = bridgeDepositApi;
  const activeBridge = depositApi?.activeBridge;
  const selectedBridgeCurrency = useMemo(() => {
    if (!activeBridge) {
      return undefined;
    }
    return activeBridge.currency;
  }, [activeBridge]);

  const allCurrencies = useMemo(() => {
    if (activeChain) {
      return getTokensOfChain(activeChain.id).map((token) => fromBridgeCurrencyToCurrencyView(token));
    }
    return getTokens().map((token) => fromBridgeCurrencyToCurrencyView(token));
  }, [activeChain, getTokens, getTokensOfChain]);

  const handleSuccess = useCallback((): void => {}, []);
  // const [selectedToken, setSelectedToken] = useState<Currency | undefined>(undefined);

  const selectedCurrency = useMemo(() => {
    if (!bridgeDepositApi.selectedBridgeCurrency) {
      return undefined;
    }
    return fromBridgeCurrencyToCurrencyView(bridgeDepositApi.selectedBridgeCurrency);
  }, [bridgeDepositApi.selectedBridgeCurrency]);

  const [item, setItem] = useState<MixerSize | undefined>(undefined);
  const [destChain, setDestChain] = useState<ChainId | undefined>(undefined);
  const tokenChains = useMemo(() => {
    return selectedBridgeCurrency?.chainIds ?? [];
  }, [selectedBridgeCurrency]);
  const disabledDepositButton = typeof item?.id === 'undefined' || typeof destChain === 'undefined';

  const selectItems = useMemo(() => {
    return tokenChains.map((chainId) => {
      if (!chainsPopulated[chainId]) {
        throw new Error(`Chain with ${chainId} isn't configured`);
      }
      const chain = chainsPopulated[chainId];
      return {
        id: chainId,
        chain,
      };
    });
  }, [tokenChains]);
  return (
    <TokenInfoWrapper>
      <InputSection>
        <InputLabel label={'Chains for token'}>
          {/* used for positioning the token input label */}
          <div style={{ height: '52px' }}></div>
          <TokenInput
            currencies={allCurrencies}
            value={selectedCurrency}
            onChange={(currencyContent) => {
              if (currencyContent) {
                bridgeDepositApi.setSelectedCurrency(BridgeCurrency.fromString(currencyContent.view.id));
              }
            }}
          />
        </InputLabel>
      </InputSection>
      <SpaceBox height={16} />
      <InputSection>
        <InputLabel label={'Chains available for token'}>
          {selectItems.map(({ chain, id }) => {
            return (
              <Flex ai='center' row flex={1}>
                <ListItemAvatar>
                  <Avatar style={{ background: 'transparent' }} children={<chain.logo />} />
                </ListItemAvatar>
                <ListItemText>
                  <Typography variant={'h6'} component={'span'} display={'block'}>
                    <b>{chain.name}</b>
                  </Typography>
                  <Typography variant={'body2'} color={'textSecondary'}>
                    <ChainName>{chain.name}</ChainName>
                  </Typography>
                </ListItemText>
              </Flex>
            );
          })}
        </InputLabel>
      </InputSection>
    </TokenInfoWrapper>
  );
};
