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
import SlideAnimation from '../../../components/SlideAnimation';
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
  const { apiConfig, activeWallet, activeChain, loading, switchChain } =
    useWebContext();

  const { toggleModal } = useConnectWallet();

  const { pathname } = useLocation();

  const navigate = useNavigateWithPersistParams();

  const [searchParams] = useSearchParams();

  const { fungibleCfg } = useCurrenciesFromRoute();

  const currentTab = useMemo(() => {
    return BRIDGE_TABS.find((tab) => pathname.includes(tab));
  }, [pathname]);

  const srcChain = useMemo(() => {
    const typedChainId = searchParams.get(SOURCE_CHAIN_KEY);
    if (!typedChainId) {
      return undefined;
    }

    return apiConfig.chains[+typedChainId];
  }, [apiConfig.chains, searchParams]);

  const destChain = useMemo(() => {
    const typedChainId = searchParams.get(DEST_CHAIN_KEY);
    if (!typedChainId) {
      return undefined;
    }

    return apiConfig.chains[+typedChainId];
  }, [apiConfig.chains, searchParams]);

  const chains = useMemo<Array<ChainType>>(() => {
    if (currentTab === 'withdraw' && chainType === 'dest') {
      return Object.values(getActiveSourceChains(apiConfig.chains)).map(
        (c) =>
          ({
            name: c.name,
            tag: c.tag,
          } satisfies ChainType)
      );
    }

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
  }, [apiConfig.anchors, apiConfig.chains, chainType, currentTab, fungibleCfg]);

  const defaultCategory = useMemo<ChainListCardProps['defaultCategory']>(() => {
    if (chainType === 'dest') {
      return;
    }

    if (currentTab === 'deposit') {
      return srcChain?.tag;
    }
  }, [chainType, currentTab, srcChain?.tag]);

  const onlyCategory = useMemo<ChainListCardProps['onlyCategory']>(() => {
    if (chainType === 'source') {
      return;
    }

    if (currentTab === 'deposit') {
      return srcChain?.tag ?? destChain?.tag;
    }

    return destChain?.tag;
  }, [chainType, currentTab, destChain?.tag, srcChain?.tag]);

  const handleClose = useCallback(
    (typedChainId?: number) => {
      if (currentTab == null) {
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
    [chainType, currentTab, navigate, pathname, searchParams]
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
      if (currentTab) {
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
    [activeWallet, currentTab, handleClose, switchChain, toggleModal]
  );

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
