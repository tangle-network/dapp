import { type FC, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router';
import { formatEther } from 'viem';

import { ArrowRight, GasStationFill } from '@webb-tools/icons';
import {
  Button,
  ConnectWalletMobileButton,
  TransactionInputCard,
  useCheckMobile,
  FeeDetails,
} from '@webb-tools/webb-ui-components';
import PageTabsContainer from '../../../../containers/PageTabsContainer';

import { useBalancesFromNotes } from '@webb-tools/react-hooks/currency/useBalancesFromNotes';
import useAmountWithRoute from '../../../../hooks/useAmountWithRoute';
import useChainsFromRoute from '../../../../hooks/useChainsFromRoute';
import useCurrenciesFromRoute from '../../../../hooks/useCurrenciesFromRoute';
import useNavigateWithPersistParams from '../../../../hooks/useNavigateWithPersistParams';
import useDefaultChainAndPool from '../../../../hooks/useDefaultChainAndPool';
import useUnwrapButtonProps from './private/useUnwrapButtonProps';

import {
  SELECT_SOURCE_CHAIN_PATH,
  SELECT_SOURCE_TOKEN_PATH,
  SELECT_DESTINATION_TOKEN_PATH,
  WRAPPER_TABS,
} from '../../../../constants';

const Unwrap: FC = () => {
  const { pathname } = useLocation();

  const { isMobile } = useCheckMobile();

  const { balances } = useBalancesFromNotes();

  const navigate = useNavigateWithPersistParams();

  useDefaultChainAndPool();

  const [amount, setAmount] = useAmountWithRoute();
  const { srcTypedChainId } = useChainsFromRoute();
  const { fungibleCfg, wrappableCfg } = useCurrenciesFromRoute();

  const fungibleMaxAmount = useMemo(() => {
    if (typeof srcTypedChainId !== 'number') {
      return;
    }

    if (fungibleCfg && balances[fungibleCfg.id]?.[srcTypedChainId]) {
      return Number(formatEther(balances[fungibleCfg.id][srcTypedChainId]));
    }
  }, [balances, fungibleCfg, srcTypedChainId]);

  const { ...unwrapBtnProps } = useUnwrapButtonProps({
    balances,
    fungible: fungibleCfg,
  });

  const amountProps = useMemo(
    () => ({
      amount,
      onAmountChange: setAmount,
    }),
    [amount, setAmount]
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
            tokenSymbol={fungibleCfg?.symbol}
            maxAmount={fungibleMaxAmount}
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
            tokenSymbol={wrappableCfg?.symbol}
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
          {/* TODO: calculate gas */}
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
            <Button isFullWidth {...unwrapBtnProps} />
          ) : (
            <ConnectWalletMobileButton isFullWidth />
          )}
        </div>
      </div>
    </PageTabsContainer>
  );
};

export default Unwrap;
