import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { CurrencyConfig } from '@webb-tools/dapp-config/currencies/currency-config.interface';
import { useCurrenciesBalances } from '@webb-tools/react-hooks';
import { TokenListCard } from '@webb-tools/webb-ui-components';
import { AssetType } from '@webb-tools/webb-ui-components/components/ListCard/types';
import { TokenType } from '@webb-tools/webb-ui-components/types';
import { FC, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import SlideAnimation from '../../../components/SlideAnimation';
import { POOL_KEY, SOURCE_CHAIN_KEY, TOKEN_KEY } from '../../../constants';
import useCurrenciesFromRoute from '../../../hooks/useCurrenciesFromRoute';

const SelectToken: FC<{ tokenType?: TokenType }> = ({
  tokenType = 'unshielded',
}) => {
  const [searhParams] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const srcTypedChainId = useMemo(
    () =>
      searhParams.get(SOURCE_CHAIN_KEY)
        ? Number(searhParams.get(SOURCE_CHAIN_KEY))
        : undefined,
    [searhParams]
  );

  const { apiConfig } = useWebContext();

  const {
    allCurrencies,
    allCurrencyCfgs,
    fungibleCurrencies,
    wrappableCurrencies,
  } = useCurrenciesFromRoute();

  const balances = useCurrenciesBalances(allCurrencies, srcTypedChainId);

  const popularTokens = useMemo<Array<AssetType>>(() => {
    // No popular tokens for shielded
    if (tokenType === 'shielded') {
      return [];
    }

    return wrappableCurrencies.map(
      (cfg) =>
        ({
          name: cfg.name,
          symbol: cfg.symbol,
          assetBalanceProps: {
            balance: balances[cfg.id] ?? 0,
          },
        } satisfies AssetType)
    );
  }, [balances, tokenType, wrappableCurrencies]);

  const selectTokens = useMemo<Array<AssetType>>(() => {
    return fungibleCurrencies.map(
      (cfg) =>
        ({
          name: cfg.name,
          symbol: cfg.symbol,
          assetBalanceProps: {
            balance: balances[cfg.id] ?? 0,
          },
        } satisfies AssetType)
    );
  }, [balances, fungibleCurrencies]);

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
        txnType={'deposit'}
      />
    </SlideAnimation>
  );
};

export default SelectToken;
