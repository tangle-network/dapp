import { Currency, MixerSize, WalletConfig } from '@webb-dapp/api-providers';
import { DepositConfirm } from '@webb-dapp/mixer/components/DepositConfirm/DepositConfirm';
import { useDeposit } from '@webb-dapp/mixer/hooks/deposit/useDeposit';
import { RequiredWalletSelection } from '@webb-dapp/react-components/RequiredWalletSelection/RequiredWalletSelection';
import { useWebContext } from '@webb-dapp/react-environment';
import { useCurrencies } from '@webb-dapp/react-hooks/currency';
import { useCurrencyBalance } from '@webb-dapp/react-hooks/currency/useCurrencyBalance';
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
import styled from 'styled-components';

export const DepositWrapper = styled.div<{ wallet: WalletConfig | undefined }>`
  padding: 25px 35px;
  background: ${({ theme }) => theme.layer2Background};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 16px;
`;

export const TokenInputWrapper = styled.div`
  .token-dropdown-section {
    display: flex;
    width: 100%;
    justify-content: space-between;
    margin-bottom: 20px;
  }
`;

type DepositProps = {};

export const Deposit: React.FC<DepositProps> = () => {
  const { activeApi, activeChain, activeWallet } = useWebContext();
  const depositApi = useDeposit();
  const { governedCurrencies, wrappableCurrencies } = useCurrencies();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Currency | undefined>(undefined);
  const [item, setItem] = useState<MixerSize | undefined>(undefined);

  const activeToken = useMemo<Currency | undefined>(
    // Governed Currencies also populate the mixer's activeToken.
    // TODO: Remove this workaround for substrate native token populating.
    () => selectedToken ?? [...wrappableCurrencies, ...governedCurrencies][0],
    [wrappableCurrencies, governedCurrencies, selectedToken]
  );

  const intendedMixers = useMemo(() => {
    return depositApi.mixerSizes.filter((mixerSize) => {
      // Cannot assume activeToken will have a value. If it doesn't, then automatically return false.
      if (!activeToken) {
        return false;
      }
      return mixerSize.asset === activeToken.view.symbol;
    });
  }, [depositApi.mixerSizes, activeToken]);

  const tokenBalance = useCurrencyBalance(activeToken);

  // Whenever mixerSizes change (like chain switch) or token changes, set selected mixer to undefined
  useEffect(() => {
    setItem(undefined);
  }, [depositApi.mixerSizes, activeToken]);

  return (
    <DepositWrapper wallet={activeWallet}>
      <RequiredWalletSelection>
        <TokenInputWrapper>
          <InputTitle leftLabel={<TextLabel value='TOKEN' />} />
          <div className='token-dropdown-section'>
            <TokenInput
              currencies={wrappableCurrencies}
              value={activeToken}
              onChange={(token) => {
                setSelectedToken(token);
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
