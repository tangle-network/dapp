import { ArrowRight, GasStationFill } from '@webb-tools/icons';
import { formatEther } from 'viem';
import { useCurrenciesBalances } from '@webb-tools/react-hooks';
import { useBalancesFromNotes } from '@webb-tools/react-hooks/currency/useBalancesFromNotes';
import {
  Button,
  ConnectWalletMobileButton,
  FeeDetails,
  TransactionInputCard,
  useCheckMobile,
} from '@webb-tools/webb-ui-components';
import { useMemo } from 'react';
import { Outlet, useLocation } from 'react-router';
import SlideAnimation from '../../../../components/SlideAnimation';
import {
  BRIDGE_TABS,
  SELECT_DESTINATION_CHAIN_PATH,
  SELECT_SHIELDED_POOL_PATH,
  SELECT_SOURCE_CHAIN_PATH,
  SELECT_TOKEN_PATH,
} from '../../../../constants';
import PageTabsContainer from '../../../../containers/PageTabsContainer';
import useNavigateWithPersistParams from '../../../../hooks/useNavigateWithPersistParams';
import useDepositButtonProps from './private/useDepositButtonProps';
import useWatchSearchParams from './private/useWatchSearchParams';

const Deposit = () => {
  const navigate = useNavigateWithPersistParams();

  const { isMobile } = useCheckMobile();

  const { pathname } = useLocation();

  const {
    allCurrencies,
    amount,
    destTypedChainId,
    fungibleCfg,
    onAmountChange,
    srcTypedChainId,
    wrappableCfg,
  } = useWatchSearchParams();

  const { balances: walletBalances } = useCurrenciesBalances(
    allCurrencies,
    srcTypedChainId
  );

  const { balances: shieldedBalances } = useBalancesFromNotes();

  const { depositConfirmComponent, ...depositBtnProps } = useDepositButtonProps(
    {
      balance: wrappableCfg ? walletBalances[wrappableCfg.id] : undefined,
      fungible: fungibleCfg,
    }
  );

  const amountProps = useMemo(
    () => ({
      amount,
      onAmountChange,
    }),
    [amount, onAmountChange]
  );

  const totalFungibleAmount = useMemo(() => {
    if (typeof destTypedChainId !== 'number') {
      return;
    }

    if (fungibleCfg && shieldedBalances[fungibleCfg.id]?.[destTypedChainId]) {
      return Number(
        formatEther(shieldedBalances[fungibleCfg.id][destTypedChainId])
      );
    }
  }, [shieldedBalances, fungibleCfg, destTypedChainId]);

  const lastPath = useMemo(() => pathname.split('/').pop(), [pathname]);
  if (lastPath && !BRIDGE_TABS.find((tab) => lastPath === tab)) {
    return <Outlet />;
  }

  if (depositConfirmComponent !== null) {
    return (
      <SlideAnimation key={`deposit-confirm`}>
        {depositConfirmComponent}
      </SlideAnimation>
    );
  }

  return (
    <PageTabsContainer pageType="bridge">
      <div className="flex flex-col space-y-6 grow">
        <div className="space-y-2">
          <TransactionInputCard.Root
            typedChainId={srcTypedChainId}
            tokenSymbol={wrappableCfg?.symbol}
            maxAmount={
              wrappableCfg ? walletBalances[wrappableCfg.id] : undefined
            }
            {...amountProps}
          >
            <TransactionInputCard.Header>
              <TransactionInputCard.ChainSelector
                onClick={() => navigate(SELECT_SOURCE_CHAIN_PATH)}
              />
              <TransactionInputCard.MaxAmountButton />
            </TransactionInputCard.Header>

            <TransactionInputCard.Body
              tokenSelectorProps={{
                onClick: () => navigate(SELECT_TOKEN_PATH),
              }}
            />
          </TransactionInputCard.Root>

          <ArrowRight size="lg" className="mx-auto rotate-90" />

          <TransactionInputCard.Root
            typedChainId={destTypedChainId}
            tokenSymbol={fungibleCfg?.symbol}
            maxAmount={totalFungibleAmount}
            {...amountProps}
          >
            <TransactionInputCard.Header>
              <TransactionInputCard.ChainSelector
                onClick={() => navigate(SELECT_DESTINATION_CHAIN_PATH)}
              />
              <TransactionInputCard.MaxAmountButton
                accountType="note"
                disabled
              />
            </TransactionInputCard.Header>

            <TransactionInputCard.Body
              tokenSelectorProps={{
                placeHolder: 'Select pool',
                onClick: () => navigate(SELECT_SHIELDED_POOL_PATH),
              }}
              customAmountProps={{
                isDisabled: true,
                className: 'text-mono-200 dark:text-mono-0 cursor-not-allowed',
              }}
            />
          </TransactionInputCard.Root>
        </div>

        <div className="flex flex-col justify-between grow">
          <FeeDetails
            info="The fee pays for the transaction to be processed on the network."
            items={[
              {
                name: 'Gas',
                Icon: <GasStationFill />,
              },
            ]}
          />

          {!isMobile ? (
            <Button isFullWidth {...depositBtnProps} />
          ) : (
            <ConnectWalletMobileButton isFullWidth />
          )}
        </div>
      </div>
    </PageTabsContainer>
  );
};

export default Deposit;
