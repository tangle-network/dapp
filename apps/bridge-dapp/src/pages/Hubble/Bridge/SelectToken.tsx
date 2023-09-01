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
import {
  BRIDGE_TABS,
  DEST_CHAIN_KEY,
  POOL_KEY,
  SOURCE_CHAIN_KEY,
  TOKEN_KEY,
} from '../../../constants';
import useCurrenciesFromRoute from '../../../hooks/useCurrenciesFromRoute';

const SelectToken: FC = () => {
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

  const { allCurrencies, allCurrencyCfgs } = useCurrenciesFromRoute(
    currentTxType === 'deposit' ? srcTypedChainId : destTypedChainId
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

    if (typeof destTypedChainId === 'number') {
      return fungible.addresses.get(destTypedChainId);
    }

    return undefined;
  }, [apiConfig.currencies, destTypedChainId, searhParams]);

  const { balances, isLoading: isBalancesLoading } = useCurrenciesBalances(
    allCurrencies,
    currentTxType === 'withdraw' ? destTypedChainId : srcTypedChainId,
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

        const address = getAddress(currencyCfg, srcTypedChainId);
        const explorerUrl = getExplorerUrl(address, blockExplorer);

        return {
          name: currencyCfg.name,
          symbol: currencyCfg.symbol,
          tokenType: 'unshielded',
          explorerUrl: explorerUrl,
          assetBalanceProps: balanceProps,
          assetBadgeProps: badgeProps,
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
        title="Select a token"
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
) =>
  !isLoading &&
  balances[currencyCfg.id] &&
  (txType !== 'withdraw' || currencyCfg.role !== CurrencyRole.Governable)
    ? { balance: balances[currencyCfg.id] }
    : undefined;

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
    ? new URL(`/address${addr}`, blockExplorer).toString()
    : undefined;
