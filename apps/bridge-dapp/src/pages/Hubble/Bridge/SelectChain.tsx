import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import chainsPopulated from '@webb-tools/dapp-config/chains/chainsPopulated';
import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import ChainListCard from '@webb-tools/webb-ui-components/components/ListCard/ChainListCard';
import {
  ChainListCardProps,
  ChainType,
} from '@webb-tools/webb-ui-components/components/ListCard/types';
import { FC, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import {
  BRIDGE_TABS,
  DEST_CHAIN_KEY,
  SOURCE_CHAIN_KEY,
} from '../../../constants';
import { useConnectWallet } from '../../../hooks/useConnectWallet';
import useCurrenciesFromRoute from '../../../hooks/useCurrenciesFromRoute';
import useNavigateWithPersistParams from '../../../hooks/useNavigateWithPersistParams';
import { getActiveSourceChains } from '../../../utils/getActiveSourceChains';

const SelectChain: FC<{ chainType: ChainListCardProps['chainType'] }> = ({
  chainType,
}) => {
  const { apiConfig, activeChain, activeWallet, loading, switchChain } =
    useWebContext();

  const { toggleModal } = useConnectWallet();

  const { pathname } = useLocation();

  const navigate = useNavigateWithPersistParams();

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

  const isOnBridgeTab = useMemo(() => {
    return !!BRIDGE_TABS.find((tab) => pathname.includes(tab));
  }, [pathname]);

  const handleClose = useCallback(
    (typedChainId?: number) => {
      if (!isOnBridgeTab) {
        navigate(-1);
        return;
      }

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
    [chainType, isOnBridgeTab, navigate, pathname, searchParams]
  );

  const handleChainChange = useCallback(
    async ({ name, tag }: ChainType) => {
      const chain = Object.values(chainsPopulated).find(
        (chainCfg) => chainCfg.name === name && chainCfg.tag === tag
      );

      if (!chain) {
        return;
      }

      // If the source chain is render on the bridge tab,
      // we just need to set the query param and close the modal
      if (isOnBridgeTab) {
        return handleClose(calculateTypedChainId(chain.chainType, chain.id));
      }

      // Otherwise perform the switch chain action
      if (activeWallet && chain.wallets.includes(activeWallet.id)) {
        await switchChain(chain, activeWallet);
      } else {
        toggleModal(true, chain);
      }

      handleClose();
    },
    [activeWallet, handleClose, isOnBridgeTab, switchChain, toggleModal]
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
