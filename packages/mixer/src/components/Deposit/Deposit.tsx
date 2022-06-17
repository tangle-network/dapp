import { Typography } from '@material-ui/core';
import { Currency, MixerSize, WalletConfig } from '@webb-dapp/api-providers';
import { DepositConfirm } from '@webb-dapp/mixer/components/DepositConfirm/DepositConfirm';
import { useDeposit } from '@webb-dapp/mixer/hooks/deposit/useDeposit';
import { RequiredWalletSelection } from '@webb-dapp/react-components/RequiredWalletSelection/RequiredWalletSelection';
import { useAppConfig, useWebContext } from '@webb-dapp/react-environment';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { SpaceBox } from '@webb-dapp/ui-components/Box';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { BalanceLabel } from '@webb-dapp/ui-components/Inputs/BalanceLabel/BalanceLabel';
import { InputTitle } from '@webb-dapp/ui-components/Inputs/InputTitle/InputTitle';
import { MixerGroupSelect } from '@webb-dapp/ui-components/Inputs/MixerGroupSelect/MixerGroupSelect';
import { TextLabel } from '@webb-dapp/ui-components/Inputs/TextLabel/TextLabel';
import { TokenInput } from '@webb-dapp/ui-components/Inputs/TokenInput/TokenInput';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import { getRoundedAmountString } from '@webb-dapp/ui-components/utils';
import React, { useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

export const DepositWrapper = styled.div<{ wallet: WalletConfig | undefined }>`
  ${({ theme, wallet }) => {
    if (wallet) {
      return css``;
    } else {
      return css`
        padding: 25px 35px;
        background: ${theme.layer2Background};
        border: 1px solid ${theme.borderColor};
        border-radius: 0 0 13px 13px;
      `;
    }
  }}
`;

export const TokenInputWrapper = styled.div`
  padding: 25px 35px;
  background: ${({ theme }) => theme.layer2Background};
  border-radius: 0 0 13px 13px;
  border: 1px solid ${({ theme }) => theme.borderColor};

  .token-dropdown-section {
    display: flex;
    width: 100%;
    justify-content: space-between;
    margin-bottom: 20px;
  }
`;

export const TokenBalance = styled.div`
  border: 1px solid ${({ theme }) => theme.primaryText};
  border-radius: 5px;
  margin-left: 5px;
  padding: 0 5px;
`;

type DepositProps = {};

export const Deposit: React.FC<DepositProps> = () => {
  const { activeApi, activeChain, activeWallet } = useWebContext();
  const depositApi = useDeposit();
  const palette = useColorPallet();
  const { currencies: currenciesConfig } = useAppConfig();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Currency | undefined>(undefined);
  const [item, setItem] = useState<MixerSize | undefined>(undefined);
  const [tokenBalance, setTokenBalance] = useState('');

  const allCurrencies = useMemo(() => {
    return activeChain
      ? activeChain.currencies.map((currencyId) => {
          return Currency.fromCurrencyId(currenciesConfig, currencyId);
        })
      : [];
  }, [activeChain, currenciesConfig]);
  const activeToken = useMemo<Currency | undefined>(
    () => selectedToken ?? allCurrencies[0],
    [allCurrencies, selectedToken]
  );

  // Whenever mixerSizes change (like chain switch) or token changes, set selected mixer to undefined
  useEffect(() => {
    setItem(undefined);
  }, [depositApi.mixerSizes, activeToken]);

  // Side effect for getting the balance of the token
  useEffect(() => {
    if (!activeToken || !activeChain || !activeApi) {
      return;
    }

    activeApi.methods.chainQuery
      .tokenBalanceByCurrencyId(activeChain.id, activeToken.view.id as any)
      .then((balance) => {
        setTokenBalance(balance);
      });
  }, [activeApi, activeApi?.accounts.activeOrDefault, activeChain, activeToken]);

  const intendedMixers = useMemo(() => {
    return depositApi.mixerSizes.filter((mixerSize) => {
      // Cannot assume activeToken will have a value. If it doesn't, then automatically return false.
      if (!activeToken) {
        return false;
      }
      return mixerSize.asset === activeToken.view.symbol;
    });
  }, [depositApi.mixerSizes, activeToken]);

  return (
    <DepositWrapper wallet={activeWallet}>
      <RequiredWalletSelection>
        <TokenInputWrapper>
          <InputTitle leftLabel={<TextLabel value='TOKEN' />} />
          <div className='token-dropdown-section'>
            <TokenInput
              currencies={allCurrencies}
              value={activeToken}
              onChange={(token) => {
                setSelectedToken(Currency.fromCurrencyId(currenciesConfig, token.view.id));
              }}
              wrapperStyles={{ width: '100%' }}
            />
          </div>
          <InputTitle
            leftLabel={<TextLabel value='AMOUNT' />}
            rightLabel={
              <BalanceLabel
                value={
                  getRoundedAmountString(Number(tokenBalance)) +
                  ' ' +
                  (selectedToken?.view.symbol ?? activeToken?.view.symbol ?? '')
                }
              />
            }
          />
          <MixerGroupSelect items={intendedMixers} value={item} onChange={setItem} />
          <SpaceBox height={16} />
          <MixerButton
            disabled={!depositApi.ready || !item}
            onClick={() => {
              setShowDepositModal(true);
            }}
            label={'Deposit'}
          />
        </TokenInputWrapper>
        <Modal open={showDepositModal}>
          <DepositConfirm
            onSuccess={() => {
              setShowDepositModal(false);
            }}
            open={showDepositModal}
            onClose={() => {
              setShowDepositModal(false);
            }}
            provider={depositApi}
            mixerSize={item}
          />
        </Modal>
      </RequiredWalletSelection>
    </DepositWrapper>
  );
};
