import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import { CurrencyConfig } from '@webb-tools/dapp-config/currencies/currency-config.interface';
import { CurrencyRole } from '@webb-tools/dapp-types/Currency';
import { Currency } from '@webb-tools/abstract-api-provider/currency';
import { useCurrenciesBalances } from '@webb-tools/react-hooks';
import { TokenListCard } from '@webb-tools/webb-ui-components';
import { AssetType } from '@webb-tools/webb-ui-components/components/ListCard/types';
import { FC, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import SlideAnimation from '../../../components/SlideAnimation';
import { POOL_KEY, TOKEN_KEY } from '../../../constants';
import useChainsFromRoute from '../../../hooks/useChainsFromRoute';
import useCurrenciesFromRoute from '../../../hooks/useCurrenciesFromRoute';
import useWrapperTabFromRoute from '../../../hooks/useWrapperTabFromRoute';

const SelectToken: FC<{ type: 'src' | 'dest' }> = ({ type }) => {
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const currentWrapperType = useWrapperTabFromRoute();

  const { apiConfig } = useWebContext();

  const { srcChainCfg, srcTypedChainId } = useChainsFromRoute();

  const blockExplorer = useMemo(() => {
    return srcChainCfg?.blockExplorers?.default.url;
  }, [srcChainCfg]);

  const {
    wrappableCurrencies: wrappableCurrencyCfgs,
    fungibleCurrencies: fungibleCurrencyCfgs,
  } = useCurrenciesFromRoute(srcTypedChainId ?? undefined);

  const isFungibleTokenList = useMemo(
    () =>
      (currentWrapperType === 'wrap' && type === 'dest') ||
      (currentWrapperType === 'unwrap' && type === 'src'),
    [currentWrapperType, type]
  );

  const currencyCfgs = useMemo(
    () => (isFungibleTokenList ? fungibleCurrencyCfgs : wrappableCurrencyCfgs),
    [isFungibleTokenList, fungibleCurrencyCfgs, wrappableCurrencyCfgs]
  );

  const currencies = useMemo(
    () => currencyCfgs.map((currencyCfg) => new Currency(currencyCfg)),
    [currencyCfgs]
  );

  const fungibleAddress = useMemo(() => {
    const poolId = searchParams.get(POOL_KEY);
    if (!poolId) {
      return;
    }

    const fungible = apiConfig.currencies[Number(poolId)];
    if (!fungible) {
      return;
    }

    if (typeof srcTypedChainId === 'number') {
      return fungible.addresses.get(srcTypedChainId);
    }

    return undefined;
  }, [apiConfig.currencies, searchParams, srcTypedChainId]);

  const sourceAddress = useMemo(
    () => (isFungibleTokenList ? fungibleAddress : undefined),
    [isFungibleTokenList, fungibleAddress]
  );

  const { balances, isLoading: isBalancesLoading } = useCurrenciesBalances(
    currencies,
    srcTypedChainId ?? undefined,
    sourceAddress
  );

  const selectTokens = useMemo<Array<AssetType>>(
    () =>
      currencyCfgs.map((currencyCfg) => {
        const balanceProps =
          type === 'src'
            ? getBalanceProps(currencyCfg, balances, isBalancesLoading)
            : undefined;

        const badgeProps = getBadgeProps(
          currencyCfg,
          balances,
          isBalancesLoading,
          currentWrapperType
        );

        const address = getAddress(currencyCfg, srcTypedChainId ?? undefined);
        const explorerUrl = getExplorerUrl(address, blockExplorer);

        return {
          name: currencyCfg.name,
          symbol: currencyCfg.symbol,
          tokenType: 'unshielded',
          explorerUrl: explorerUrl,
          assetBalanceProps: balanceProps,
          assetBadgeProps: badgeProps,
          isLoadingMetadata: isBalancesLoading,
        } satisfies AssetType;
      }),
    // prettier-ignore
    [type, currencyCfgs, balances, blockExplorer, currentWrapperType, isBalancesLoading, srcTypedChainId]
  );

  const targetParam = useMemo(
    () => (isFungibleTokenList ? POOL_KEY : TOKEN_KEY),
    [isFungibleTokenList]
  );

  const handleClose = useCallback(
    (selectedCfg?: CurrencyConfig) => {
      const params = new URLSearchParams(searchParams);
      if (selectedCfg) {
        params.set(targetParam, `${selectedCfg.id}`);
      }

      const path = pathname.split('/').slice(0, -1).join('/');
      navigate({
        pathname: path,
        search: params.toString(),
      });
    },
    [navigate, pathname, searchParams, targetParam]
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
        title={`Select ${type === 'src' ? 'source' : 'destination'} token`}
        popularTokens={[]}
        selectTokens={selectTokens}
        unavailableTokens={[]} // TODO: Add unavailable tokens
        onChange={handleTokenChange}
        onClose={() => handleClose()}
      />
    </SlideAnimation>
  );
};

export default SelectToken;

/** @internal */
const getAddress = (currencyCfg: CurrencyConfig, srcTypedChainId?: number) =>
  typeof srcTypedChainId === 'number'
    ? currencyCfg.addresses.get(srcTypedChainId)
    : undefined;

/** @internal */
const getBalanceProps = (
  currencyCfg: CurrencyConfig,
  balances: Record<number, number>,
  isLoading?: boolean
) => {
  if (isLoading) {
    return;
  }

  const currencyBalance = balances[currencyCfg.id];

  // For fungible/governable tokens, users can withdraw unlimited amount
  if (currencyCfg.role === CurrencyRole.Governable) {
    return { balance: Infinity };
  }

  // For wrapping tokens and unwrapping non-fungible/non-governable tokens, use the balance from balances record
  if (currencyBalance) {
    return { balance: currencyBalance };
  }
};

/** @internal */
const getBadgeProps = (
  currencyCfg: CurrencyConfig,
  balances: Record<number, number>,
  isLoading?: boolean,
  wrapperType?: ReturnType<typeof useWrapperTabFromRoute>
) =>
  !isLoading &&
  !balances[currencyCfg.id] &&
  (wrapperType !== 'unwrap' || currencyCfg.role !== CurrencyRole.Governable)
    ? {
        variant: 'warning' as const,
        children:
          wrapperType === 'unwrap' ? 'Insufficient liquidity' : 'No balance',
      }
    : undefined;

/** @internal */
const getExplorerUrl = (addr?: string, blockExplorer?: string) =>
  blockExplorer && addr && BigInt(addr) !== ZERO_BIG_INT
    ? new URL(`/address/${addr}`, blockExplorer).toString()
    : undefined;
