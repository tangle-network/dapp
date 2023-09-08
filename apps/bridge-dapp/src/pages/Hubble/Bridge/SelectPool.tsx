import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { ChainConfig } from '@webb-tools/dapp-config/chains/chain-config.interface';
import { CurrencyConfig } from '@webb-tools/dapp-config/currencies/currency-config.interface';
import {
  BalancesFromNotesType,
  useBalancesFromNotes,
} from '@webb-tools/react-hooks/currency/useBalancesFromNotes';
import { TokenListCard } from '@webb-tools/webb-ui-components';
import { AssetType } from '@webb-tools/webb-ui-components/components/ListCard/types';
import { FC, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { formatEther } from 'viem';
import SlideAnimation from '../../../components/SlideAnimation';
import {
  BRIDGE_TABS,
  DEST_CHAIN_KEY,
  POOL_KEY,
  SOURCE_CHAIN_KEY,
} from '../../../constants';
import useCurrenciesFromRoute from '../../../hooks/useCurrenciesFromRoute';

const SelectPool: FC = () => {
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

  const { fungibleCurrencies } = useCurrenciesFromRoute(
    currentTxType === 'deposit' ? srcTypedChainId : destTypedChainId
  );

  const { balances: balancesFromNotes } = useBalancesFromNotes();

  const pools = useMemo<Array<AssetType>>(
    () => {
      return fungibleCurrencies.map((currencyCfg) => {
        const assetBalanceProps = getBalanceProps(
          currencyCfg,
          balancesFromNotes,
          currentTxType,
          srcTypedChainId,
          destTypedChainId
        );

        const chainName = getChainName(
          apiConfig.chains,
          currentTxType,
          srcTypedChainId,
          destTypedChainId
        );

        const addr = getAddress(
          currencyCfg,
          currentTxType,
          srcTypedChainId,
          destTypedChainId
        );

        const explorerUrl = getExplorerUrl(blockExplorer, addr);

        return {
          name: currencyCfg.name,
          symbol: currencyCfg.symbol,
          tokenType: 'shielded',
          explorerUrl,
          assetBalanceProps,
          chainName,
        } satisfies AssetType;
      });
    },
    // prettier-ignore
    [apiConfig.chains, balancesFromNotes, blockExplorer, currentTxType, destTypedChainId, fungibleCurrencies, srcTypedChainId]
  );

  const unavailableTokens = useMemo<Array<AssetType>>(
    () => {
      if (currentTxType === 'deposit') {
        return [];
      }

      return Object.keys(balancesFromNotes).reduce((acc, id) => {
        const balanceRec = balancesFromNotes[+id];
        const currency = apiConfig.currencies[+id];

        Object.entries(balanceRec).forEach(([typedId, balance]) => {
          if (
            currentTxType === 'withdraw' &&
            typedId === destTypedChainId?.toString()
          ) {
            return;
          }

          if (
            currentTxType === 'transfer' &&
            typedId === srcTypedChainId?.toString()
          ) {
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
              },
              chainName: chainCfg.name,
            } satisfies AssetType);
          }
        });

        return acc;
      }, [] as Array<AssetType>);
    },
    // prettier-ignore
    [apiConfig.chains, apiConfig.currencies, balancesFromNotes, currentTxType, destTypedChainId, srcTypedChainId]
  );

  const handleClose = useCallback(
    (selectedCfg?: CurrencyConfig) => {
      const params = new URLSearchParams(searhParams);
      if (selectedCfg) {
        params.set(POOL_KEY, `${selectedCfg.id}`);
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
        title={`Select pool to ${currentTxType}`}
        popularTokens={[]}
        selectTokens={pools}
        unavailableTokens={unavailableTokens}
        onChange={handleTokenChange}
        onClose={() => handleClose()}
        txnType={currentTxType}
      />
    </SlideAnimation>
  );
};

export default SelectPool;

const getAddress = (
  currencyCfg: CurrencyConfig,
  txType?: string,
  srcTypedChainId?: number,
  destTypedChainId?: number
) =>
  (txType === 'deposit' || txType === 'transfer') &&
  typeof srcTypedChainId === 'number'
    ? currencyCfg.addresses.get(srcTypedChainId)
    : txType === 'withdraw' && typeof destTypedChainId === 'number'
    ? currencyCfg.addresses.get(destTypedChainId)
    : undefined;

const getExplorerUrl = (blockExplorer?: string, address?: string) =>
  blockExplorer && address
    ? new URL(`/address/${address}`, blockExplorer).toString()
    : undefined;

const getBalanceProps = (
  currency: CurrencyConfig,
  balances: BalancesFromNotesType,
  txType?: string,
  srcTypedChainId?: number,
  destTypedChainId?: number
) => {
  if (txType === 'withdraw' && typeof destTypedChainId === 'number') {
    const balance = balances[currency.id]?.[destTypedChainId];
    if (typeof balance === 'bigint') {
      return {
        balance: +formatEther(balance),
      };
    }
  }

  if (txType === 'transfer' && typeof srcTypedChainId === 'number') {
    const balance = balances[currency.id]?.[srcTypedChainId];
    if (typeof balance === 'bigint') {
      return {
        balance: +formatEther(balance),
      };
    }
  }

  return undefined;
};

const getChainName = (
  chainsConfig: Record<number, ChainConfig>,
  txType?: string,
  srcTypedChainId?: number,
  destTypedChainId?: number
) => {
  if (txType === 'withdraw' && typeof destTypedChainId === 'number') {
    return chainsConfig[destTypedChainId]?.name;
  }

  if (txType && txType !== 'withdraw' && typeof srcTypedChainId === 'number') {
    return chainsConfig[srcTypedChainId]?.name;
  }

  return undefined;
};
