import { useWebContext } from '@webb-tools/api-provider-environment';
import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import { ChainListCard } from '@webb-tools/webb-ui-components';
import {
  ChainListCardProps,
  ChainType,
} from '@webb-tools/webb-ui-components/components/ListCard/types';
import { FC, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { DEST_CHAIN_KEY, SOURCE_CHAIN_KEY } from '../../../constants';
import { getActiveSourceChains } from '../../../utils/getActiveSourceChains';
import { useCurrenciesFromRoute } from '../../../hooks';

const SelectChain: FC<{ chainType: ChainListCardProps['chainType'] }> = ({
  chainType,
}) => {
  const { apiConfig, activeChain, loading } = useWebContext();

  const { pathname } = useLocation();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const { fungibleCfg } = useCurrenciesFromRoute();

  const chains = useMemo<Array<ChainType>>(() => {
    if (chainType === 'dest') {
      if (!fungibleCfg) {
        return [];
      }

      return Object.keys(apiConfig.anchors[fungibleCfg.id])
        .map((typedChainId) => apiConfig.chains[+typedChainId])
        .map(
          (c) =>
            ({
              name: c.name,
              tag: c.tag,
            } satisfies ChainType)
        );
    }

    return getActiveSourceChains(apiConfig.chains).map((val) => {
      return {
        name: val.name,
        tag: val.tag,
      } satisfies ChainType;
    });
  }, [apiConfig.anchors, apiConfig.chains, chainType, fungibleCfg]);

  const handleClose = useCallback(
    (typedChainId?: number) => {
      const path = pathname.split('/').slice(0, -1).join('/');

      const params = new URLSearchParams(searchParams);
      if (typedChainId) {
        params.set(
          chainType === 'dest' ? DEST_CHAIN_KEY : SOURCE_CHAIN_KEY,
          typedChainId.toString()
        );
      }

      navigate({
        pathname: path,
        search: params.toString(),
      });
    },
    [chainType, navigate, pathname, searchParams]
  );

  const handleChainChange = useCallback(
    ({ name, tag }: ChainType) => {
      const chain = Object.values(apiConfig.chains).find(
        (chainCfg) => chainCfg.name === name && chainCfg.tag === tag
      );

      if (chain) {
        handleClose(calculateTypedChainId(chain.chainType, chain.id));
      }
    },
    [apiConfig.chains, handleClose]
  );

  return (
    <ChainListCard
      className="h-[var(--card-height)]"
      chainType={chainType}
      chains={chains}
      currentActiveChain={activeChain?.name}
      defaultCategory={activeChain?.tag}
      isConnectingToChain={loading}
      onChange={handleChainChange}
      onClose={() => handleClose()}
    />
  );
};

export default SelectChain;
