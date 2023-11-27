import { useWebContext } from '@webb-tools/api-provider-environment';
import { type ApiConfig } from '@webb-tools/dapp-config/api-config';
import type { ChainConfig } from '@webb-tools/dapp-config/chains/chain-config.interface';
import chainsPopulated from '@webb-tools/dapp-config/chains/chainsPopulated';
import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import ChainListCard from '@webb-tools/webb-ui-components/components/ListCard/ChainListCard';
import type {
  ChainListCardProps,
  ChainType,
} from '@webb-tools/webb-ui-components/components/ListCard/types';
import { useCallback, useMemo, type FC } from 'react';
import { useLocation } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { NumberParam } from 'use-query-params';
import SlideAnimation from '../../../components/SlideAnimation';
import {
  DEST_CHAIN_KEY,
  POOL_KEY,
  SOURCE_CHAIN_KEY,
  TOKEN_KEY,
} from '../../../constants';
import useChainsFromRoute from '../../../hooks/useChainsFromRoute';
import useCurrenciesFromRoute from '../../../hooks/useCurrenciesFromRoute';
import useNavigateWithPersistParams from '../../../hooks/useNavigateWithPersistParams';
import useTxTabFromRoute from '../../../hooks/useTxTabFromRoute';
import getParam from '../../../utils/getParam';

const SelectChain: FC<{ chainType: ChainListCardProps['chainType'] }> = ({
  chainType,
}) => {
  const { activeChain, loading } = useWebContext();

  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigateWithPersistParams();

  const chainsCfg = useChains(chainType);

  const updateParams = useUpdateParams();

  const chains = useMemo<Array<ChainType>>(
    () =>
      chainsCfg.map(
        (c) =>
          ({
            name: c.name,
            tag: c.tag,
          } satisfies ChainType)
      ),
    [chainsCfg]
  );

  const handleClose = useCallback(
    (nextTypedChainId?: number) => {
      const path = pathname.split('/').slice(0, -1).join('/');
      let nextParams = new URLSearchParams(searchParams);

      if (typeof nextTypedChainId === 'number') {
        nextParams = updateParams(nextParams, nextTypedChainId, chainType);
      }

      navigate({
        pathname: path,
        search: nextParams.toString(),
      });
    },
    [chainType, navigate, pathname, searchParams, updateParams]
  );

  const handleChainChange = useCallback(
    async ({ name, tag }: ChainType) => {
      const chain = Object.values(chainsPopulated).find(
        (chainCfg) => chainCfg.name === name && chainCfg.tag === tag
      );

      if (!chain) {
        return;
      }

      return handleClose(calculateTypedChainId(chain.chainType, chain.id));
    },
    [handleClose]
  );

  const { defaultCategory, onlyCategory } = useChainCategoryProps(chainType);

  return (
    <SlideAnimation>
      <ChainListCard
        className="h-[var(--card-height)]"
        chainType={chainType}
        chains={chains}
        currentActiveChain={activeChain?.name}
        defaultCategory={defaultCategory}
        onlyCategory={onlyCategory}
        isConnectingToChain={loading}
        onChange={handleChainChange}
        onClose={() => handleClose()}
      />
    </SlideAnimation>
  );
};

export default SelectChain;

/**
 * Get the chains to select for the given chain type
 * @param chainType the chain type for getting the chains
 * @returns the chains to select for the given chain type
 */
const useChains = (
  chainType: ChainListCardProps['chainType'] = 'source'
): ReadonlyArray<ChainConfig> => {
  const { apiConfig } = useWebContext();

  const { fungibleCfg } = useCurrenciesFromRoute();

  if (chainType === 'source') {
    return apiConfig.getSupportedChains({ withEnv: true });
  }

  if (!fungibleCfg) {
    return [];
  }

  const anchorRec = apiConfig.anchors[fungibleCfg.id];
  if (!anchorRec) {
    return [];
  }

  return Object.keys(anchorRec).map((typedChainId) => {
    return apiConfig.chains[parseInt(typedChainId)];
  });
};

/**
 * Get the default and only category for the chain list card
 *
 * - Default category:
 *  + Deposit & Transfer
 *   * Chain type: source => activeChain ?? 'test'
 *   * Chain type: dest => undefined
 *  + Withdraw => source => active chain ?? 'test'
 *
 * - Only category:
 *  + Deposit & Transfer
 *   * Chain type: source => undefined
 *   * Chain type: dest => category of source chain ?? undefined
 *  + Withdraw => undefined
 *
 * @param chainType whether 'source' or 'dest' (default: 'source')
 * @return {defaultCategory, onlyCategory}
 */
const useChainCategoryProps = (
  chainType: ChainListCardProps['chainType'] = 'source'
) => {
  const { activeChain } = useWebContext();

  const currentTx = useTxTabFromRoute();

  const { srcChainCfg } = useChainsFromRoute();

  const defaultCategory = useMemo<ChainListCardProps['defaultCategory']>(() => {
    if (chainType === 'source') {
      return srcChainCfg?.tag ?? activeChain?.tag ?? 'test';
    }
  }, [activeChain?.tag, chainType, srcChainCfg?.tag]);

  const onlyCategory = useMemo<ChainListCardProps['onlyCategory']>(() => {
    if (
      (currentTx === 'deposit' || currentTx === 'transfer') &&
      chainType === 'dest'
    ) {
      return srcChainCfg?.tag;
    }
  }, [chainType, currentTx, srcChainCfg?.tag]);

  return { defaultCategory, onlyCategory };
};

/**
 * Check whether the current token id is supported for the given typed chain id
 * @param params the query params to get the token id and pool id to check
 * @param nextTypedChainId the typed chain id for checking the token id
 * @param apiCfg the api config
 * @returns Check whether the token id is supported for the given typed chain id
 */
const isTokenSupported = (
  params: URLSearchParams,
  nextTypedChainId: number,
  fungibleToWrappableMap: ApiConfig['fungibleToWrappableMap']
): boolean => {
  const poolId = getParam(params, POOL_KEY, NumberParam);
  if (typeof poolId !== 'number') {
    return false;
  }

  const tokenId = getParam(params, TOKEN_KEY, NumberParam);
  if (typeof tokenId !== 'number') {
    return false;
  }

  const wrappableMap = fungibleToWrappableMap.get(poolId);
  if (!wrappableMap) {
    return false;
  }

  const wrappableSet = wrappableMap.get(nextTypedChainId);
  if (!wrappableSet) {
    return false;
  }

  return wrappableSet.has(tokenId);
};

/**
 * Check whether the dest chain id is supported for the given typed chain id
 * @param params the query params to get the dest chain id
 * @param nextTypedChainId the next typed chain id for checking the dest chain id
 * @param anchorsCfg the anchor config
 * @returns Check whether the dest chain id is supported for the given typed chain id
 */
const isDestChainSupported = (
  params: URLSearchParams,
  nextTypedChainId: number,
  anchorsCfg: ApiConfig['anchors']
): boolean => {
  const destChainId = getParam(params, DEST_CHAIN_KEY, NumberParam);
  if (typeof destChainId !== 'number') {
    return false;
  }

  // Check if exist in the anchors config
  // at least one record has the dest chain id and the next typed chain id
  return Object.values(anchorsCfg).some((anchorRecord) => {
    const keys = Object.keys(anchorRecord);

    const includeDest = keys.includes(destChainId.toString());
    const includeNext = keys.includes(nextTypedChainId.toString());

    return includeDest && includeNext;
  });
};

const useUpdateParams = () => {
  const { apiConfig } = useWebContext();

  return useCallback(
    (
      prevParams: URLSearchParams,
      nextTypedChainId: number,
      chainType: ChainListCardProps['chainType']
    ) => {
      const nextParams = new URLSearchParams(prevParams);
      const key = chainType === 'source' ? SOURCE_CHAIN_KEY : DEST_CHAIN_KEY;
      nextParams.set(key, nextTypedChainId.toString());

      if (chainType === 'dest') {
        return nextParams;
      }

      // For source chain, we need to check
      // 1. Whether the current selected token is still supported
      // 2. Whether the current destination chain is still supported

      const tokenSupported = isTokenSupported(
        nextParams,
        nextTypedChainId,
        apiConfig.fungibleToWrappableMap
      );
      if (!tokenSupported) {
        nextParams.delete(TOKEN_KEY);
      }

      const destChainSupported = isDestChainSupported(
        nextParams,
        nextTypedChainId,
        apiConfig.anchors
      );
      if (!destChainSupported) {
        nextParams.delete(DEST_CHAIN_KEY);
      }

      return nextParams;
    },
    [apiConfig.anchors, apiConfig.fungibleToWrappableMap]
  );
};
