import { type FC, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router';
import { ArrowRight } from '@webb-tools/icons';
import {
  Button,
  ConnectWalletMobileButton,
  TransactionInputCard,
  useCheckMobile,
  FeeDetails,
} from '@webb-tools/webb-ui-components';

import PageTabsContainer from '../../../../containers/PageTabsContainer';
import { useCurrenciesBalances } from '@webb-tools/react-hooks';
import useAmountWithRoute from '../../../../hooks/useAmountWithRoute';
import useChainsFromRoute from '../../../../hooks/useChainsFromRoute';
import useCurrenciesFromRoute from '../../../../hooks/useCurrenciesFromRoute';
import useNavigateWithPersistParams from '../../../../hooks/useNavigateWithPersistParams';
import useDefaultChainAndPool from '../../../../hooks/useDefaultChainAndPool';
import useWrapButtonProps from './private/useWrapButtonProps';
import useWrapFeeDetailsProps from './private/useWrapFeeDetailsProps';

import {
  SELECT_SOURCE_CHAIN_PATH,
  SELECT_SOURCE_TOKEN_PATH,
  SELECT_DESTINATION_TOKEN_PATH,
  WRAPPER_TABS,
} from '../../../../constants';

const Wrap: FC = () => {
  const { pathname } = useLocation();

  const { isMobile } = useCheckMobile();

  const navigate = useNavigateWithPersistParams();

  useDefaultChainAndPool();

  const [amount, setAmount] = useAmountWithRoute();
  const { srcTypedChainId } = useChainsFromRoute();
  const { allCurrencies, fungibleCfg, wrappableCfg } = useCurrenciesFromRoute();

  const { balances: walletBalances } = useCurrenciesBalances(
    allCurrencies,
    srcTypedChainId ?? undefined,
  );

  const { ...wrapBtnProps } = useWrapButtonProps({
    balance: wrappableCfg ? walletBalances[wrappableCfg.id] : undefined,
    fungibleCfg,
    wrappableCfg,
  });

  const feeDetailsProps = useWrapFeeDetailsProps({
    balance: wrappableCfg ? walletBalances[wrappableCfg.id] : undefined,
    fungibleCfg,
    wrappableCfg,
  });

  const amountProps = useMemo(
    () => ({
      amount,
      onAmountChange: setAmount,
    }),
    [amount, setAmount],
  );

  const lastPath = useMemo(() => pathname.split('/').pop(), [pathname]);
  if (lastPath && !WRAPPER_TABS.find((tab) => lastPath === tab)) {
    return <Outlet />;
  }

  return (
    <PageTabsContainer pageType="wrapper">
      <div className="flex flex-col space-y-6 grow">
        <div className="space-y-2">
          <TransactionInputCard.Root
            typedChainId={srcTypedChainId ?? undefined}
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
                onClick: () => navigate(SELECT_SOURCE_TOKEN_PATH),
              }}
            />
          </TransactionInputCard.Root>

          <ArrowRight size="lg" className="mx-auto rotate-90" />

          <TransactionInputCard.Root
            tokenSymbol={fungibleCfg?.symbol}
            {...amountProps}
          >
            <TransactionInputCard.Body
              tokenSelectorProps={{
                // placeHolder: 'Select pool',
                onClick: () => navigate(SELECT_DESTINATION_TOKEN_PATH),
              }}
              customAmountProps={{
                isDisabled: true,
                className: 'text-mono-200 dark:text-mono-0 cursor-not-allowed',
              }}
            />
          </TransactionInputCard.Root>
        </div>

        <div className="flex flex-col justify-between grow">
          <FeeDetails {...feeDetailsProps} />

          {!isMobile ? (
            <Button isFullWidth {...wrapBtnProps} />
          ) : (
            <ConnectWalletMobileButton isFullWidth />
          )}
        </div>
      </div>
    </PageTabsContainer>
  );
};

export default Wrap;
