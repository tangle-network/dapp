import { useWebContext } from '@webb-tools/api-provider-environment';
import { CurrencyConfig } from '@webb-tools/dapp-config/currencies/currency-config.interface';
import { ArrowRight } from '@webb-tools/icons';
import { useCurrenciesBalances } from '@webb-tools/react-hooks';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import {
  Button,
  FeeDetails,
  TransactionInputCard,
} from '@webb-tools/webb-ui-components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { formatEther, parseEther } from 'viem';
import {
  AMOUNT_KEY,
  BRIDGE_TABS,
  DEST_CHAIN_KEY,
  POOL_KEY,
  SELECT_DESTINATION_CHAIN_PATH,
  SELECT_SHIELDED_POOL_PATH,
  SELECT_SOURCE_CHAIN_PATH,
  SELECT_TOKEN_PATH,
  SOURCE_CHAIN_KEY,
  TOKEN_KEY,
} from '../../../constants';
import BridgeTabsContainer from '../../../containers/BridgeTabsContainer';
import useCurrenciesFromRoute from '../../../hooks/useCurrenciesFromRoute';

const Deposit = () => {
  const isDisabledDepositBtn = true;

  const depositBtnCnt = isDisabledDepositBtn ? 'Enter inputs' : 'Deposit';

  const navigate = useNavigate();

  const { pathname } = useLocation();

  const {
    allCurrencies,
    amount,
    destTypedChainId,
    fungibleCfg,
    onAmountChange,
    searchParams,
    setSearchParams,
    srcTypedChainId,
    wrappableCfg,
  } = useWatchSearchParams();

  const balances = useCurrenciesBalances(allCurrencies, srcTypedChainId);

  const amountProps = useMemo(
    () => ({
      amount,
      onAmountChange,
    }),
    [amount, onAmountChange]
  );

  const handleMaxBtnClick = useCallback(
    (currencyCfg?: CurrencyConfig) => {
      if (!currencyCfg || !balances[currencyCfg.id]) {
        return;
      }

      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev);
        nextParams.set(AMOUNT_KEY, balances[currencyCfg.id].toString());
        return nextParams;
      });
    },
    [balances, setSearchParams]
  );

  const lastPath = useMemo(() => pathname.split('/').pop(), [pathname]);
  if (lastPath && !BRIDGE_TABS.includes(lastPath)) {
    return <Outlet />;
  }

  return (
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
              <TransactionInputCard.MaxAmountButton
                onClick={() => handleMaxBtnClick(wrappableCfg)}
              />
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
              <TransactionInputCard.MaxAmountButton
                onClick={() => handleMaxBtnClick(fungibleCfg)}
              />
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
          <FeeDetails />

          <Button isFullWidth isDisabled={isDisabledDepositBtn}>
            {depositBtnCnt}
          </Button>
        </div>
      </div>
    </BridgeTabsContainer>
  );
};

export default Deposit;

function useWatchSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const { allCurrencies, fungibleCfg, wrappableCfg } = useCurrenciesFromRoute();

  const { activeChain, apiConfig, activeApi } = useWebContext();

  const [srcTypedChainId, destTypedChainId, tokenId, amountStr] =
    useMemo(() => {
      const sourceStr = searchParams.get(SOURCE_CHAIN_KEY) ?? '';
      const destStr = searchParams.get(DEST_CHAIN_KEY) ?? '';

      const tokenStr = searchParams.get(TOKEN_KEY) ?? '';

      const amountStr = searchParams.get('amount') ?? '';

      return [
        !Number.isNaN(parseInt(sourceStr)) ? parseInt(sourceStr) : undefined,
        !Number.isNaN(parseInt(destStr)) ? parseInt(destStr) : undefined,
        !Number.isNaN(parseInt(tokenStr)) ? parseInt(tokenStr) : undefined,
        amountStr.length ? formatEther(BigInt(amountStr)) : '',
      ];
    }, [searchParams]);

  const [amount, setAmount] = useState(amountStr);

  useEffect(() => {
    setSearchParams((prev) => {
      if (prev.has(SOURCE_CHAIN_KEY) || !activeChain) {
        return prev;
      }

      const typedChainId = calculateTypedChainId(
        activeChain.chainType,
        activeChain.id
      );
      const nextParams = new URLSearchParams(prev);
      nextParams.set(SOURCE_CHAIN_KEY, `${typedChainId}`);
      return nextParams;
    });
  }, [activeChain, setSearchParams]);

  const activeBridge = useMemo(() => {
    return activeApi?.state.activeBridge;
  }, [activeApi]);

  const defaultPoolId = useMemo(() => {
    if (!srcTypedChainId) {
      return;
    }

    if (
      activeBridge &&
      Object.keys(activeBridge.targets).includes(`${srcTypedChainId}`)
    ) {
      return `${activeBridge.currency.id}`;
    }

    const anchor = Object.entries(apiConfig.anchors).find(
      ([, anchorsRecord]) => {
        return Object.keys(anchorsRecord).includes(`${srcTypedChainId}`);
      }
    );

    return anchor?.[0];
  }, [activeBridge, apiConfig.anchors, srcTypedChainId]);

  useEffect(() => {
    setSearchParams((prev) => {
      if (!defaultPoolId) {
        return prev;
      }

      const nextParams = new URLSearchParams(prev);
      nextParams.set(POOL_KEY, `${defaultPoolId}`);

      return nextParams;
    });
  }, [defaultPoolId, setSearchParams]);

  // Remove token if it is not supported
  useEffect(() => {
    if (!tokenId) {
      return;
    }

    const currency = allCurrencies.find((c) => c.id === tokenId);
    // No currency means the token is not supported
    if (!currency) {
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev);
        nextParams.delete(TOKEN_KEY);
        return nextParams;
      });
    }
  }, [allCurrencies, setSearchParams, tokenId]);

  // Remove destination chain if it is not supported
  useEffect(() => {
    if (!destTypedChainId) {
      return;
    }

    if (!fungibleCfg) {
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev);
        nextParams.delete(DEST_CHAIN_KEY);
        return nextParams;
      });
      return;
    }

    const anchor = apiConfig.anchors[fungibleCfg.id];
    if (!Object.keys(anchor).includes(`${destTypedChainId}`)) {
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev);
        nextParams.delete(DEST_CHAIN_KEY);
        return nextParams;
      });
    }
  }, [apiConfig.anchors, destTypedChainId, fungibleCfg, setSearchParams]);

  useEffect(() => {
    function updateParams() {
      if (!amount) {
        return setSearchParams((prev) => {
          const nextParams = new URLSearchParams(prev);
          nextParams.delete(AMOUNT_KEY);
          return nextParams;
        });
      }

      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev);
        nextParams.set(AMOUNT_KEY, `${parseEther(amount)}`);
        return nextParams;
      });
    }

    const timeout = setTimeout(updateParams, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [amount, setSearchParams]);

  const handleAmountChange = useCallback((amount: string) => {
    const validationRegex = /^\d*\.?\d*$/;
    const isValid = validationRegex.test(amount);
    if (isValid) {
      setAmount(amount);
    }
  }, []);

  return {
    allCurrencies,
    amount,
    destTypedChainId,
    fungibleCfg,
    onAmountChange: handleAmountChange,
    searchParams,
    setSearchParams,
    srcTypedChainId,
    wrappableCfg,
  };
}
