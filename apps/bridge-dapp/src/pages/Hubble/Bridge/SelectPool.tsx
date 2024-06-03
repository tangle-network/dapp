import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { ChainConfig } from '@webb-tools/dapp-config/chains/chain-config.interface';
import { CurrencyConfig } from '@webb-tools/dapp-config/currencies/currency-config.interface';
import {
  BalancesFromNotesType,
  useBalancesFromNotes,
} from '@webb-tools/react-hooks/currency/useBalancesFromNotes';
import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import { TokenListCard } from '@webb-tools/webb-ui-components';
import { AssetType } from '@webb-tools/webb-ui-components/components/ListCard/types';
import { FC, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { formatEther } from 'viem';
import SlideAnimation from '../../../components/SlideAnimation';
import { POOL_KEY, SOURCE_CHAIN_KEY } from '../../../constants';
import useChainsFromRoute from '../../../hooks/useChainsFromRoute';
import useCurrenciesFromRoute from '../../../hooks/useCurrenciesFromRoute';
import useTxTabFromRoute from '../../../hooks/useTxTabFromRoute';

const SelectPool: FC = () => {
  const [searhParams] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const currentTxType = useTxTabFromRoute();

  const { apiConfig } = useWebContext();

  const { srcChainCfg, srcTypedChainId } = useChainsFromRoute();

  const blockExplorer = useMemo(() => {
    return srcChainCfg?.blockExplorers?.default.url;
  }, [srcChainCfg]);

  const { fungibleCurrencies } = useCurrenciesFromRoute(
    srcTypedChainId ?? undefined,
  );

  const { balances: balancesFromNotes, initialized } = useBalancesFromNotes();

  const pools = useMemo<Array<AssetType>>(
    () => {
      return fungibleCurrencies.map((currencyCfg) => {
        const chainName = getChainName(
          apiConfig.chains,
          currentTxType,
          srcTypedChainId,
        );

        const assetBalanceProps = getBalanceProps(
          currencyCfg,
          balancesFromNotes,
          chainName,
          currentTxType,
          srcTypedChainId,
        );

        const addr = getAddress(currencyCfg, currentTxType, srcTypedChainId);

        const explorerUrl = getExplorerUrl(blockExplorer, addr);

        return {
          name: currencyCfg.name,
          symbol: currencyCfg.symbol,
          tokenType: 'shielded',
          explorerUrl,
          assetBalanceProps,
          chainName,
          isLoadingMetadata: !initialized,
        } satisfies AssetType;
      });
    },
    // prettier-ignore
    [apiConfig.chains, balancesFromNotes, blockExplorer, currentTxType, fungibleCurrencies, initialized, srcTypedChainId],
  );

  const poolsFromBalance = useMemo<Array<AssetType>>(
    () => {
      if (currentTxType === 'deposit') {
        return [];
      }

      return Object.keys(balancesFromNotes).reduce((acc, id) => {
        const balanceRec = balancesFromNotes[+id];
        const currency = apiConfig.currencies[+id];

        Object.entries(balanceRec).forEach(([typedId, balance]) => {
          if (currentTxType && typedId === srcTypedChainId?.toString()) {
            return;
          }

          const chainCfg = apiConfig.chains[+typedId];
          if (typeof balance === 'bigint') {
            acc.push({
              name: currency.name,
              symbol: currency.symbol,
              tokenType: 'shielded',
              assetBalanceProps: {
                balance: +formatEther(balance),
                subContent: chainCfg.name,
              },
              chainName: chainCfg.name,
              isLoadingMetadata: !initialized,
            } satisfies AssetType);
          }
        });

        return acc;
      }, [] as Array<AssetType>);
    },
    // prettier-ignore
    [apiConfig.chains, apiConfig.currencies, balancesFromNotes, currentTxType, initialized, srcTypedChainId],
  );

  const alertTitle = useMemo(() => {
    switch (currentTxType) {
      case 'deposit':
        return 'The availability of shielded pools is determined by your selected source chain and token.';
      default:
        return 'The availability of shielded pools is subject to the balance in your account.';
    }
  }, [currentTxType]);

  const handleClose = useCallback(
    (selectedCfg?: CurrencyConfig, chainName?: string) => {
      const params = new URLSearchParams(searhParams);
      if (selectedCfg) {
        params.set(POOL_KEY, `${selectedCfg.id}`);
      }

      const chain = chainName
        ? Object.values(apiConfig.chains).find((cfg) => cfg.name === chainName)
        : undefined;

      if (chain) {
        params.set(
          SOURCE_CHAIN_KEY,
          calculateTypedChainId(chain.chainType, chain.id).toString(),
        );
      }

      const path = pathname.split('/').slice(0, -1).join('/');
      navigate({
        pathname: path,
        search: params.toString(),
      });
    },
    [apiConfig.chains, navigate, pathname, searhParams],
  );

  const handleTokenChange = useCallback(
    ({ name, symbol, chainName }: AssetType) => {
      const currencyCfg = Object.values(apiConfig.currencies).find(
        (cfg) => cfg.name === name && cfg.symbol === symbol,
      );

      handleClose(currencyCfg, chainName);
    },
    [apiConfig.currencies, handleClose],
  );

  return (
    <SlideAnimation>
      <TokenListCard
        className="h-[var(--card-height)]"
        title={`Select pool to ${currentTxType}`}
        type="pool"
        popularTokens={[]}
        selectTokens={pools.concat(poolsFromBalance)}
        unavailableTokens={[]}
        onChange={handleTokenChange}
        onClose={() => handleClose()}
        alertTitle={alertTitle}
      />
    </SlideAnimation>
  );
};

export default SelectPool;

const getAddress = (
  currencyCfg: CurrencyConfig,
  txType?: string,
  srcTypedChainId?: number | null,
) =>
  txType && typeof srcTypedChainId === 'number'
    ? currencyCfg.addresses.get(srcTypedChainId)
    : undefined;

const getExplorerUrl = (blockExplorer?: string, address?: string) =>
  blockExplorer && address
    ? new URL(`/address/${address}`, blockExplorer).toString()
    : undefined;

const getBalanceProps = (
  currency: CurrencyConfig,
  balances: BalancesFromNotesType,
  chainName?: string,
  txType?: string,
  srcTypedChainId?: number | null,
) => {
  if (!txType || typeof srcTypedChainId !== 'number') {
    return;
  }
  const balance = balances[currency.id]?.[srcTypedChainId] ?? 0;

  return {
    balance: +formatEther(balance),
    subContent: chainName,
  };
};

const getChainName = (
  chainsConfig: Record<number, ChainConfig>,
  txType?: string,
  srcTypedChainId?: number | null,
) => {
  if (!txType || typeof srcTypedChainId !== 'number') {
    return;
  }

  return chainsConfig[srcTypedChainId]?.name;
};
