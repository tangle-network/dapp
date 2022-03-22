import { Typography } from '@material-ui/core';
import { DepositConfirm } from '@webb-dapp/mixer/components/DepositConfirm/DepositConfirm';
import { useDeposit } from '@webb-dapp/mixer/hooks/deposit/useDeposit';
import { RequiredWalletSelection } from '@webb-dapp/react-components/RequiredWalletSelection/RequiredWalletSelection';
import { WalletConfig } from '@webb-dapp/react-environment/types/wallet-config.interface';
import { MixerSize, useWebContext } from '@webb-dapp/react-environment/webb-context';
import { Currency } from '@webb-dapp/react-environment/webb-context/currency/currency';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { SpaceBox } from '@webb-dapp/ui-components/Box';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { MixerGroupSelect } from '@webb-dapp/ui-components/Inputs/MixerGroupSelect/MixerGroupSelect';
import { TokenInput } from '@webb-dapp/ui-components/Inputs/TokenInput/TokenInput';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import { getRoundedAmountString } from '@webb-dapp/ui-components/utils';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

const DepositWrapper = styled.div<{ wallet: WalletConfig | undefined }>`
  ${({ theme, wallet }) => {
    if (wallet) return css``;
    else
      return css`
        padding: 25px 35px;
        background: ${theme.layer2Background};
        border: 1px solid ${theme.borderColor};
        border-radius: 0 0 13px 13px;
      `;
  }}
`;

const TokenInputWrapper = styled.div`
  padding: 25px 35px;
  background: ${({ theme }) => theme.layer2Background};
  border-radius: 0 0 13px 13px;
  border: 1px solid ${({ theme }) => theme.borderColor};

  .titles-and-information {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .token-dropdown-section {
    display: flex;
    width: 100%;
    justify-content: space-between;
    margin-bottom: 20px;
  }
`;

const TokenBalance = styled.div`
  border: 1px solid ${({ theme }) => theme.primaryText};
  border-radius: 5px;
  margin-left: 5px;
  padding: 0 5px;
`;

type DepositProps = {};

export const Deposit: React.FC<DepositProps> = () => {
  const { activeApi, activeChain, activeWallet, chains, switchChain } = useWebContext();
  const depositApi = useDeposit();
  const palette = useColorPallet();

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Currency | undefined>(undefined);
  const [item, setItem] = useState<MixerSize | undefined>(undefined);
  const [tokenBalance, setTokenBalance] = useState('');

  const allCurrencies = useMemo(() => {
    return activeChain?.nativeCurrencyId ? [Currency.fromCurrencyId(activeChain.nativeCurrencyId)] : [];
  }, [activeChain]);
  const active = useMemo(() => selectedToken ?? allCurrencies[0], [allCurrencies, selectedToken]);

  // Whenever mixerSizes change (like chain switch), set selected mixer to undefined
  useEffect(() => {
    setItem(undefined);
  }, [depositApi.mixerSizes]);

  // Side effect for getting the balance of the token
  useEffect(() => {
    if (!selectedToken || !activeChain || !activeApi) return;

    activeApi.methods.chainQuery.tokenBalanceByCurrencyId(selectedToken.view.id as any).then((balance) => {
      setTokenBalance(balance);
    });
  }, [activeApi, activeChain, selectedToken]);

  return (
    <DepositWrapper wallet={activeWallet}>
      <RequiredWalletSelection>
        <TokenInputWrapper>
          <div className='titles-and-information'>
            <Typography variant='h6'>
              <b>TOKEN</b>
            </Typography>
          </div>
          <div className='token-dropdown-section'>
            <TokenInput
              currencies={allCurrencies}
              value={active}
              onChange={(token) => {
                setSelectedToken(Currency.fromCurrencyId(token.view.id));
              }}
              wrapperStyles={{ width: '100%' }}
            />
          </div>
          <div className='titles-and-information'>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant='h6'>
                <b>AMOUNT</b>
              </Typography>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div>
                <Typography
                  variant='body2'
                  style={{ color: palette.type === 'dark' ? palette.accentColor : palette.primaryText }}
                >
                  Your Balance~
                </Typography>
              </div>
              <TokenBalance>
                <Typography variant='body2'>
                  {getRoundedAmountString(Number(tokenBalance))} {selectedToken?.view.symbol}
                </Typography>
              </TokenBalance>
            </div>
          </div>
          <MixerGroupSelect items={depositApi.mixerSizes} value={item} onChange={setItem} />
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
