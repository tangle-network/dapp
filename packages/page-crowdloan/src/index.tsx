import { alpha, ButtonBase, Checkbox, InputBase, Typography } from '@mui/material';
import { Currency, PresetTypedChainId } from '@webb-dapp/api-providers';
import { WalletConfig } from '@webb-dapp/api-providers/types';
import { chainsPopulated, WalletId } from '@webb-dapp/apps/configs';
import WEBBLogo from '@webb-dapp/apps/configs/logos/chains/WebbLogo';
import { pageWithFeatures } from '@webb-dapp/react-components/utils/FeaturesGuard/pageWithFeatures';
import { appEvent } from '@webb-dapp/react-environment/app-event';
import { useAppConfig, useWebContext } from '@webb-dapp/react-environment/webb-context';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { useModal } from '@webb-dapp/react-hooks/useModal';
import { SpaceBox } from '@webb-dapp/ui-components/Box';
import { MixerButton, MixerButtonProps } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { BalanceLabel } from '@webb-dapp/ui-components/Inputs/BalanceLabel/BalanceLabel';
import { InputTitle } from '@webb-dapp/ui-components/Inputs/InputTitle/InputTitle';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { getRoundedAmountString } from '@webb-dapp/ui-components/utils';
import { above, useBreakpoint } from '@webb-dapp/ui-components/utils/responsive-utils';
import { calculateTypedChainId, FixedPointNumber } from '@webb-tools/sdk-core';
import { FC, Fragment, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

import { useCrowdloan } from './hooks/useCrowdloan';
import { ConfirmationModal } from './ConfirmationModal';

const ALLOTTED_REWARDS_POOL = 5000000;

export const PageCrowdloanWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0px auto;

  ${above.md`
    flex-direction: row; 
    align-items: flex-start;
  `}
`;

export const AmountInputWrapper = styled.div<{ disabled: boolean }>`
  display: flex;
  ${({ theme }: { theme: Pallet }) => css`
    border: 1px solid ${theme.heavySelectionBorderColor};
    color: ${theme.primaryText};
    background: ${theme.heavySelectionBackground};
  `}
  height: 50px;
  border-radius: 10px;
  padding: 8px 16px;
  align-items: center;
  justify-content: space-between;
  margin: 0 1rem;
  margin-bottom: 8px;

  ${above.sm`
    margin: 0 2rem; 
    margin-bottom: 8px;
  `}

  && {
    cursor: ${({ disabled }) => (disabled ? 'no-drop' : 'auto')};
  }
`;

export const AmountButton = styled.button`
  padding: 0 4px;

  && {
    transition: none;
    color: ${({ theme }) => alpha(theme.accentColor, 0.8)};

    :hover {
      color: ${({ theme }) => theme.accentColor};
    }
  }
`;

const ContributeWrapper = styled.div<{ wallet: WalletConfig | undefined }>`
  box-sizing: border-box;
  border-radius: 12px;
  ${({ theme }: { theme: Pallet }) => css`
    background: ${theme.layer2Background};
    border: 1px solid ${theme.borderColor};
  `}
  max-width: 500px;

  .checkbox-wrapper {
    margin-left: -9px;
    padding: 0 1rem;

    ${above.sm`
      padding: 0 2rem;
    `}
  }
`;

const MixerButtonWrapper = styled.div`
  padding: 0 1rem;
  padding-bottom: 1rem;

  ${above.sm`
    padding: 0 2rem;
    padding-bottom: 2rem;
  `}
`;

const TitleWrapper = styled.div`
  padding: 0 1rem;
  padding-top: 1rem;

  ${above.sm`
    padding: 0 2rem;
    padding-top: 2rem;
  `}
`;

const RewardWrapper = styled.div`
  background-color: ${({ theme }) => theme.layer1Background};
  padding: 12px 1rem;

  ${above.sm`
    padding: 24px 2rem; 
  `}

  svg {
    width: 32px;
    height: 32px;
  }
`;

const RewardContentWrapper = styled.div`
  margin-top: 8px;
  margin-left: 12px;
  width: 80%;

  .content {
    margin-top: 8px;

    p:not(:last-child) {
      margin-bottom: 4px;

      ${above.lg`
        margin-bottom: 8px;
      `}
    }
  }
`;

const CheckboxWrapper = styled.div<{ disabled: boolean }>`
  display: flex;
  padding: 8px 1rem 0px 1rem;
  opacity: ${({ disabled }) => (disabled ? 0.4 : 1)};

  ${above.xs`
    padding: 8px 2rem 0px 2rem;
  `}
`;

export type PageCrowdloanProps = {};

const PageCrowdloan: FC<PageCrowdloanProps> = () => {
  const { activeApi, activeChain, activeWallet, isConnecting } = useWebContext();
  const { amount, contribute, fundInfo, getFundInfo, setAmount } = useCrowdloan();
  const palette = useColorPallet();
  const { currencies: currenciesConfig } = useAppConfig();
  const { isMdOrAbove } = useBreakpoint();

  /** TODO:
   * - Determine when the modal will open
   * - Transaction url
   * */
  const { close, status } = useModal(false);
  const transactionUrl = useMemo(() => 'https://etherscan.io', []);

  const [displayedAmount, setDisplayedAmount] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [blockNumber, setBlockNumber] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const allCurrencies = useMemo(() => {
    return activeChain
      ? activeChain.currencies.map((currencyId) => {
          return new Currency(currenciesConfig[currencyId]);
        })
      : [];
  }, [activeChain, currenciesConfig]);

  const activeToken = useMemo<Currency | undefined>(() => allCurrencies[0], [allCurrencies]);
  const isFundingEnded = useMemo(() => BigInt(blockNumber) > fundInfo.end, [blockNumber, fundInfo]);
  const allottedRewardsPool = useMemo(() => FixedPointNumber.fromInner(ALLOTTED_REWARDS_POOL, 10), []);

  const estReward = useMemo(() => {
    const raised = FixedPointNumber.fromInner(fundInfo.raised.toString(), activeToken?.getDecimals());
    return amount.div(raised).times(allottedRewardsPool);
  }, [amount, fundInfo, activeToken, allottedRewardsPool]);

  const confirmText = useMemo(
    () =>
      "Your KSM will be contributed to the crowdloan for Webb's Kusama parachain slot lease and locked for the duration of the lease. If this crowdloan does not win an auction slot, your KSM will be returned.",
    []
  );

  const isConnectedToKusama = useMemo(() => {
    return (
      activeChain && calculateTypedChainId(activeChain.chainType, activeChain.chainId) === PresetTypedChainId.Kusama
    );
  }, [activeChain]);

  const buttonProps = useMemo<Pick<MixerButtonProps, 'label' | 'disabled' | 'onClick'>>(() => {
    if (isConnecting || loading) {
      return { label: 'Loading...', disabled: true };
    }

    if (!isConnectedToKusama) {
      return {
        label: 'Connect to Kusama network',
        disabled: false,
        onClick: async () => {
          const chainConfig = chainsPopulated[PresetTypedChainId.Kusama];
          const walletConfig = Object.values(chainConfig.wallets).find((wallet) => wallet.id === WalletId.Polkadot);
          if (!walletConfig) {
            return;
          }

          appEvent.send('switchNetwork', [chainConfig, walletConfig]);
        },
      };
    }

    if (error) {
      return { label: 'Amount exceeds cap', disabled: true };
    }

    if (isFundingEnded) {
      return { label: 'Funding ended', disabled: true };
    }

    if (!amount || !isConfirmed) {
      return {
        label: 'Contribute',
        disabled: true,
      };
    }

    return {
      label: 'Contribute',
      disabled: false,
      onClick: async () => {
        try {
          setLoading(true);
          await contribute();
        } finally {
          setLoading(false);
        }
      },
    };
  }, [isConnecting, isConnectedToKusama, error, isFundingEnded, amount, isConfirmed, loading, contribute]);

  // Get balance of token
  useEffect(() => {
    if (!activeToken || !activeChain || !activeApi) {
      return;
    }

    activeApi.methods.chainQuery
      .tokenBalanceByCurrencyId(
        calculateTypedChainId(activeChain.chainType, activeChain.chainId),
        activeToken.view.id as any
      )
      .then((balance) => {
        setTokenBalance(Number(balance));
      });
  }, [activeApi, activeApi?.accounts.activeOrDefault, activeChain, activeToken]);

  // Get current block
  useEffect(() => {
    if (!activeChain || !activeApi) {
      return;
    }

    activeApi.methods.chainQuery.currentBlock().then((blockNumber) => {
      setBlockNumber(blockNumber);
    });
  }, [activeApi, activeApi?.accounts.activeOrDefault, activeChain, activeToken]);

  useEffect(() => {
    if (fundInfo.cap > BigInt(0)) {
      return;
    }

    getFundInfo();
  }, [fundInfo, getFundInfo]);

  return (
    <Fragment>
      <PageCrowdloanWrapper>
        <ContributeWrapper wallet={activeWallet}>
          <TitleWrapper>
            <InputTitle
              leftLabel={isMdOrAbove ? 'Contribution Amount' : 'Amount'}
              rightLabel={
                <BalanceLabel
                  value={`${getRoundedAmountString(Number(tokenBalance))} ${activeToken?.view.symbol ?? ''}`.trim()}
                />
              }
            />
          </TitleWrapper>

          <AmountInputWrapper disabled={isFundingEnded}>
            <InputBase
              disabled={isFundingEnded}
              placeholder={`Enter Amount`}
              fullWidth
              value={displayedAmount}
              inputProps={{ style: { fontSize: 14, cursor: isFundingEnded ? 'no-drop' : 'auto' } }}
              onChange={async (event) => {
                setDisplayedAmount(event.target.value);
                let maybeNumber = Number(event.target.value);
                const decimal = activeToken?.getDecimals();

                if (!Number.isNaN(maybeNumber)) {
                  let fixed = new FixedPointNumber(event.target.value, decimal);
                  let cap = FixedPointNumber.fromInner(fundInfo.cap.toString(), decimal);
                  let raised = FixedPointNumber.fromInner(fundInfo.raised.toString(), decimal);
                  if (fixed.isLessThan(new FixedPointNumber(0.1, decimal))) {
                    setError('Amount must be greater than 0.1');
                  } else if (cap.minus(raised).isGreaterThan(fixed)) {
                    setError('');
                    setAmount(fixed);
                  } else {
                    setError('Amount exceeds the cap');
                  }
                } else {
                  setAmount(new FixedPointNumber(tokenBalance, decimal));
                }
              }}
            />
            <AmountButton
              disabled={isFundingEnded}
              as={ButtonBase}
              onClick={() => {
                setDisplayedAmount(tokenBalance.toString());
                setAmount(new FixedPointNumber(tokenBalance, activeToken?.getDecimals()));
              }}
            >
              MAX
            </AmountButton>
          </AmountInputWrapper>

          <RewardWrapper>
            <Flex row>
              <WEBBLogo />

              <RewardContentWrapper>
                <Typography variant='h6' style={{ fontWeight: '700' }}>
                  Webb Rewards
                </Typography>
                <Flex row jc='space-between'>
                  <div className='content'>
                    <Typography variant='body2'>Your contribution amount:</Typography>
                    <Typography variant='body2'>Est. Rewards:</Typography>
                    <Typography variant='body2'>Total contribution amout:</Typography>
                  </div>
                  <div className='content'>
                    <Typography variant='body2'>
                      <b>{amount.toNumber().toLocaleString()}</b>
                    </Typography>
                    <Typography variant='body2'>
                      <b>{isNaN(estReward.toNumber()) ? '-' : estReward.toNumber().toLocaleString()}</b>
                    </Typography>
                    <Typography variant='body2'>
                      <b>{fundInfo.raised.toLocaleString()}</b>
                    </Typography>
                  </div>
                </Flex>
              </RewardContentWrapper>
            </Flex>
          </RewardWrapper>

          <CheckboxWrapper disabled={isFundingEnded}>
            <Checkbox
              disabled={isFundingEnded}
              size='medium'
              checked={isConfirmed}
              onChange={() => setIsConfirmed((p) => !p)}
              inputProps={{ 'aria-label': 'controlled' }}
              style={{ color: palette.accentColor, display: 'block', padding: 0, paddingRight: '8px' }}
            />
            <Typography display='block' variant='caption' className='checkbox-label'>
              {confirmText}
            </Typography>
          </CheckboxWrapper>

          <SpaceBox height={16} />

          <MixerButtonWrapper>
            <MixerButton {...buttonProps} />
          </MixerButtonWrapper>
        </ContributeWrapper>
      </PageCrowdloanWrapper>

      <Modal open={status} onClose={close}>
        <ConfirmationModal onClose={close} amountContributed={amount} estRewards={estReward} txUrl={transactionUrl} />
      </Modal>
    </Fragment>
  );
};

export default pageWithFeatures({
  features: [],
  message: 'The crowdloan module is not supported on this chain.',
})(PageCrowdloan);
