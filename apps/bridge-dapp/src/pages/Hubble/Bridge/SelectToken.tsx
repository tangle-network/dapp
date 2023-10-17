import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import { CurrencyConfig } from '@webb-tools/dapp-config/currencies/currency-config.interface';
import { CurrencyRole } from '@webb-tools/dapp-types/Currency';
import { useCurrenciesBalances } from '@webb-tools/react-hooks';
import { TokenListCard } from '@webb-tools/webb-ui-components';
import { AssetType } from '@webb-tools/webb-ui-components/components/ListCard/types';
import { FC, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import SlideAnimation from '../../../components/SlideAnimation';
import { POOL_KEY, TOKEN_KEY } from '../../../constants';
import useChainsFromRoute from '../../../hooks/useChainsFromRoute';
import useCurrenciesFromRoute from '../../../hooks/useCurrenciesFromRoute';
import useTxTabFromRoute from '../../../hooks/useTxTabFromRoute';

const SelectToken: FC = () => {
  const [searhParams] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const currentTxType = useTxTabFromRoute();

  const { apiConfig } = useWebContext();

  const { srcChainCfg, srcTypedChainId } = useChainsFromRoute();

  const blockExplorer = useMemo(() => {
    return srcChainCfg?.blockExplorers?.default.url;
  }, [srcChainCfg]);

  const { allCurrencies, allCurrencyCfgs } = useCurrenciesFromRoute(
    srcTypedChainId ?? undefined
  );

  const fungibleAddress = useMemo(() => {
    const poolId = searhParams.get(POOL_KEY);
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
  }, [apiConfig.currencies, searhParams, srcTypedChainId]);

  const { balances, isLoading: isBalancesLoading } = useCurrenciesBalances(
    allCurrencies,
    srcTypedChainId ?? undefined,
    currentTxType === 'withdraw' ? fungibleAddress : undefined
  );

  const selectTokens = useMemo<Array<AssetType>>(
    () =>
      allCurrencyCfgs.map((currencyCfg) => {
        const balanceProps = getBalanceProps(
          currencyCfg,
          balances,
          isBalancesLoading,
          currentTxType
        );

        const badgeProps = getBadgeProps(
          currencyCfg,
          balances,
          isBalancesLoading,
          currentTxType
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
    [allCurrencyCfgs, balances, blockExplorer, currentTxType, isBalancesLoading, srcTypedChainId]
  );

  const handleClose = useCallback(
    (selectedCfg?: CurrencyConfig) => {
      const params = new URLSearchParams(searhParams);
      if (selectedCfg) {
        params.set(TOKEN_KEY, `${selectedCfg.id}`);
      }

      const path = pathname.split('/').slice(0, -1).join('/');
      navigate({
        pathname: path,
        search: params.toString(),
      });
    },
    [navigate, pathname, searhParams]
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
        title={`Select ${currentTxType ?? 'a'} token`}
        popularTokens={[]}
        selectTokens={selectTokens}
        unavailableTokens={[]} // TODO: Add unavailable tokens
        onChange={handleTokenChange}
        onClose={() => handleClose()}
        txnType={currentTxType}
      />
    </SlideAnimation>
  );
};

export default SelectToken;

const getAddress = (currencyCfg: CurrencyConfig, srcTypedChainId?: number) =>
  typeof srcTypedChainId === 'number'
    ? currencyCfg.addresses.get(srcTypedChainId)
    : undefined;

const getBalanceProps = (
  currencyCfg: CurrencyConfig,
  balances: Record<number, number>,
  isLoading?: boolean,
  txType?: string
) => {
  if (isLoading) {
    return;
  }

  const currencyBalance = balances[currencyCfg.id];

  // Deposit means wrap tokens, uses the users balance from balances record
  if (txType === 'deposit' && currencyBalance) {
    return {
      balance: currencyBalance,
    };
  }

  // Withdraw means unwrap tokens
  if (txType === 'withdraw') {
    // For fungible/governable tokens, users can withdraw unlimited amount
    if (currencyCfg.role === CurrencyRole.Governable) {
      return { balance: Infinity };
    }

    // For non-fungible/non-governable tokens, use the balance from balances record
    if (currencyBalance) {
      return { balance: currencyBalance };
    }
  }
};

const getBadgeProps = (
  currencyCfg: CurrencyConfig,
  balances: Record<number, number>,
  isLoading?: boolean,
  txType?: string
) =>
  !isLoading &&
  !balances[currencyCfg.id] &&
  (txType !== 'withdraw' || currencyCfg.role !== CurrencyRole.Governable)
    ? {
        variant: 'warning' as const,
        children:
          txType === 'withdraw' ? 'Insufficient liquidity' : 'No balance',
      }
    : undefined;

const getExplorerUrl = (addr?: string, blockExplorer?: string) =>
  blockExplorer && addr && BigInt(addr) !== ZERO_BIG_INT
    ? new URL(`/address/${addr}`, blockExplorer).toString()
    : undefined;
