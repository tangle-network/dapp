import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { CurrencyConfig } from '@webb-tools/dapp-config/currencies/currency-config.interface';
import {
  useBalancesFromNotes,
  useCurrenciesBalances,
} from '@webb-tools/react-hooks';
import { TokenListCard } from '@webb-tools/webb-ui-components';
import { AssetType } from '@webb-tools/webb-ui-components/components/ListCard/types';
import { TokenType } from '@webb-tools/webb-ui-components/types';
import { FC, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import SlideAnimation from '../../../components/SlideAnimation';
import {
  BRIDGE_TABS,
  DEST_CHAIN_KEY,
  POOL_KEY,
  SOURCE_CHAIN_KEY,
  TOKEN_KEY,
} from '../../../constants';
import useCurrenciesFromRoute from '../../../hooks/useCurrenciesFromRoute';

const SelectToken: FC<{ tokenType?: TokenType }> = ({
  tokenType = 'unshielded',
}) => {
  const [searhParams] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const currentTxType = useMemo(() => {
    return BRIDGE_TABS.find((tab) => pathname.includes(tab));
  }, [pathname]);

  const { apiConfig } = useWebContext();

  const [srcTypedChainId, destTypedChainId] = useMemo(() => {
    const srcTypedId = searhParams.get(SOURCE_CHAIN_KEY)
      ? Number(searhParams.get(SOURCE_CHAIN_KEY))
      : undefined;

    const destTypedId = searhParams.get(DEST_CHAIN_KEY)
      ? Number(searhParams.get(DEST_CHAIN_KEY))
      : undefined;

    return [srcTypedId, destTypedId];
  }, [searhParams]);

  const [srcChainCfg, destChainCfg] = useMemo(() => {
    const srcChainCfg =
      typeof srcTypedChainId === 'number'
        ? apiConfig.chains[srcTypedChainId]
        : undefined;

    const destChainCfg =
      typeof destTypedChainId === 'number'
        ? apiConfig.chains[destTypedChainId]
        : undefined;

    return [srcChainCfg, destChainCfg];
  }, [apiConfig.chains, destTypedChainId, srcTypedChainId]);

  const blockExplorer = useMemo(() => {
    if (currentTxType === 'deposit' && srcChainCfg) {
      return srcChainCfg.blockExplorers?.default.url;
    } else if (currentTxType === 'withdraw' && destChainCfg) {
      return destChainCfg.blockExplorers?.default.url;
    }
  }, [currentTxType, destChainCfg, srcChainCfg]);

  const {
    allCurrencies,
    allCurrencyCfgs,
    fungibleCurrencies,
    wrappableCurrencies,
  } = useCurrenciesFromRoute(
    currentTxType === 'deposit' ? srcTypedChainId : destTypedChainId
  );

  const balances = useCurrenciesBalances(allCurrencies, srcTypedChainId);

  const balancesFromNotes = useBalancesFromNotes();

  const popularTokens = useMemo<Array<AssetType>>(() => {
    // No popular tokens for shielded
    if (tokenType === 'shielded') {
      return [];
    }

    return wrappableCurrencies.map((cfg) => {
      return {
        name: cfg.name,
        symbol: cfg.symbol,
        assetBalanceProps:
          currentTxType === 'deposit'
            ? {
                balance: balances[cfg.id] ?? 0,
              }
            : undefined,
      } satisfies AssetType;
    });
  }, [balances, currentTxType, tokenType, wrappableCurrencies]);

  const selectTokens = useMemo<Array<AssetType>>(() => {
    return fungibleCurrencies.map((cfg) => {
      const assetBalanceProps: AssetType['assetBalanceProps'] =
        currentTxType === 'deposit'
          ? {
              balance: balances[cfg.id] ?? 0,
            }
          : currentTxType === 'withdraw' && destTypedChainId && tokenType === 'shielded'
          ? {
              balance: balancesFromNotes[cfg.id]?.[destTypedChainId] ?? 0,
            }
          : undefined;

      let tokenAddress: string | undefined;
      if (currentTxType === 'deposit' && typeof srcTypedChainId === 'number'){
        tokenAddress = cfg.addresses.get(srcTypedChainId);
      } else if (currentTxType === 'withdraw' && typeof destTypedChainId === 'number') {
        tokenAddress = cfg.addresses.get(destTypedChainId);
      }

      const explorerUrl = blockExplorer && tokenAddress ? new URL(`address/${tokenAddress}`, blockExplorer) : undefined

      return {
        name: cfg.name,
        symbol: cfg.symbol,
        assetBalanceProps,
        tokenType,
        explorerUrl: explorerUrl?.toString(),
      } satisfies AssetType;
    });
  }, [balances, balancesFromNotes, blockExplorer, currentTxType, destTypedChainId, fungibleCurrencies, srcTypedChainId, tokenType]); // prettier-ignore

  const unavailableTokens = useMemo<Array<AssetType>>(() => {
    const currency =
      tokenType === 'shielded' ? fungibleCurrencies : allCurrencyCfgs;

    return apiConfig.getUnavailableCurrencies(currency).map(
      (cfg) =>
        ({
          name: cfg.name,
          symbol: cfg.symbol,
          assetBalanceProps: {
            balance: balances[cfg.id] ?? 0,
          },
        } satisfies AssetType)
    );
  }, [allCurrencyCfgs, apiConfig, balances, fungibleCurrencies, tokenType]);

  const handleClose = useCallback(
    (selectedCfg?: CurrencyConfig) => {
      const params = new URLSearchParams(searhParams);
      if (selectedCfg) {
        const key = tokenType === 'shielded' ? POOL_KEY : TOKEN_KEY;
        params.set(key, `${selectedCfg.id}`);
      }

      const path = pathname.split('/').slice(0, -1).join('/');
      navigate({
        pathname: path,
        search: params.toString(),
      });
    },
    [navigate, pathname, searhParams, tokenType]
  );

  const handleTokenChange = useCallback(
    ({ name, symbol }: AssetType) => {
      const currencyCfg = Object.values(apiConfig.currencies).find(
        (cfg) => cfg.name === name && cfg.symbol === symbol
      );

      handleClose(currencyCfg);
    },
    [apiConfig.currencies, handleClose]
  );

  return (
    <SlideAnimation>
      <TokenListCard
        className="h-[var(--card-height)]"
        title={`Select a ${tokenType === 'shielded' ? 'pool' : 'token'}`}
        popularTokens={popularTokens}
        selectTokens={selectTokens}
        unavailableTokens={unavailableTokens}
        onChange={handleTokenChange}
        onClose={() => handleClose()}
        txnType={currentTxType}
      />
    </SlideAnimation>
  );
};

export default SelectToken;
