import { ArrowRight, GasStationFill } from '@webb-tools/icons';
import { useCurrenciesBalances } from '@webb-tools/react-hooks';
import {
  Button,
  FeeDetails,
  TransactionInputCard,
} from '@webb-tools/webb-ui-components';
import { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import SlideAnimation from '../../../../components/SlideAnimation';
import {
  BRIDGE_TABS,
  SELECT_DESTINATION_CHAIN_PATH,
  SELECT_SHIELDED_POOL_PATH,
  SELECT_SOURCE_CHAIN_PATH,
  SELECT_TOKEN_PATH,
} from '../../../../constants';
import BridgeTabsContainer from '../../../../containers/BridgeTabsContainer';
import useDepositButtonProps from './private/useDepositButtonProps';
import useWatchSearchParams from './private/useWatchSearchParams';

const Deposit = () => {
  const navigate = useNavigate();

  const { pathname } = useLocation();

  const {
    allCurrencies,
    amount,
    destTypedChainId,
    fungibleCfg,
    onAmountChange,
    searchParams,
    srcTypedChainId,
    wrappableCfg,
  } = useWatchSearchParams();

  const balances = useCurrenciesBalances(allCurrencies, srcTypedChainId);

  const { depositConfirmComponent, ...depositBtnProps } = useDepositButtonProps(
    {
      balance: wrappableCfg ? balances[wrappableCfg.id] : undefined,
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

  const lastPath = useMemo(() => pathname.split('/').pop(), [pathname]);
  if (lastPath && !BRIDGE_TABS.includes(lastPath)) {
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
    <SlideAnimation key={`deposit`}>
      <BridgeTabsContainer>
        <div className="flex flex-col space-y-6 grow">
          <div className="space-y-2">
            <TransactionInputCard.Root
              typedChainId={srcTypedChainId}
              tokenSymbol={wrappableCfg?.symbol}
              maxAmount={wrappableCfg ? balances[wrappableCfg.id] : undefined}
              {...amountProps}
            >
              <TransactionInputCard.Header>
                <TransactionInputCard.ChainSelector
                  onClick={() =>
                    navigate({
                      pathname: SELECT_SOURCE_CHAIN_PATH,
                      search: searchParams.toString(),
                    })
                  }
                />
                <TransactionInputCard.MaxAmountButton />
              </TransactionInputCard.Header>

              <TransactionInputCard.Body
                tokenSelectorProps={{
                  onClick: () =>
                    navigate({
                      pathname: SELECT_TOKEN_PATH,
                      search: searchParams.toString(),
                    }),
                }}
              />
            </TransactionInputCard.Root>

            <ArrowRight size="lg" className="mx-auto rotate-90" />

            <TransactionInputCard.Root
              typedChainId={destTypedChainId}
              tokenSymbol={fungibleCfg?.symbol}
              maxAmount={fungibleCfg ? balances[fungibleCfg.id] : undefined}
              {...amountProps}
            >
              <TransactionInputCard.Header>
                <TransactionInputCard.ChainSelector
                  onClick={() =>
                    navigate({
                      pathname: SELECT_DESTINATION_CHAIN_PATH,
                      search: searchParams.toString(),
                    })
                  }
                />
                <TransactionInputCard.MaxAmountButton />
              </TransactionInputCard.Header>

              <TransactionInputCard.Body
                tokenSelectorProps={{
                  placeHolder: 'Select pool',
                  onClick: () =>
                    navigate({
                      pathname: SELECT_SHIELDED_POOL_PATH,
                      search: searchParams.toString(),
                    }),
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

            <Button isFullWidth {...depositBtnProps} />
          </div>
        </div>
      </BridgeTabsContainer>
    </SlideAnimation>
  );
};

export default Deposit;
