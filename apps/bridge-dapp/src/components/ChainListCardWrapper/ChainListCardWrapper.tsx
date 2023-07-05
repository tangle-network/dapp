import { useWebContext } from '@webb-tools/api-provider-environment';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { ChainListCard, useWebbUI } from '@webb-tools/webb-ui-components';
import { FC, useCallback, useMemo } from 'react';
import { useConnectWallet } from '../../hooks';
import { ChainListCardWrapperProps } from './types';
import { getNativeCurrencyFromConfig } from '@webb-tools/dapp-config';
import { getActiveSourceChains } from '../../utils/getActiveSourceChains';
import { Bridge } from '@webb-tools/abstract-api-provider';

/**
 * The wrapper component for the ChainListCard component
 * to share the common props and logic
 */
export const ChainListCardWrapper: FC<ChainListCardWrapperProps> = ({
  chains: chainsProps,
  chainType = 'source',
  currentActiveChain: currentActiveChainProps,
  fungibleCurrency,
  onChange,
  onClose,
  ...props
}) => {
  const { setMainComponent } = useWebbUI();

  const { toggleModal } = useConnectWallet();

  const {
    activeChain,
    activeWallet,
    apiConfig,
    chains: chainsConfig,
    loading,
    switchChain,
  } = useWebContext();

  const currentActiveChain = useMemo(() => {
    if (currentActiveChainProps) return currentActiveChainProps;

    return activeChain?.name;
  }, [activeChain, currentActiveChainProps]);

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
      return;
    }

    setMainComponent(undefined);
  }, [onClose, setMainComponent]);

  const chains = useMemo(() => {
    if (chainsProps) return chainsProps;

    return getActiveSourceChains(apiConfig.chains).map((val) => {
      const currency = getNativeCurrencyFromConfig(
        apiConfig.currencies,
        calculateTypedChainId(val.chainType, val.id)
      );

      return {
        name: val.name,
        tag: val.tag,
        symbol: currency?.symbol ?? 'Unknown',
      };
    });
  }, [apiConfig, chainsProps]);

  const handleChainChange = useCallback<NonNullable<typeof onChange>>(
    async (selectedChain) => {
      if (onChange) {
        onChange(selectedChain);
        return;
      }

      const chain = Object.values(chainsConfig).find(
        (val) => val.name === selectedChain.name
      );

      if (!chain) {
        throw new Error('Selected chain is currently unsupported');
      }

      const isSupported =
        activeWallet &&
        activeWallet.supportedChainIds.includes(
          calculateTypedChainId(chain.chainType, chain.id)
        );

      let bridge: Bridge | undefined;
      const bridgeConfig =
        fungibleCurrency && apiConfig.bridgeByAsset[fungibleCurrency.id];
      if (bridgeConfig) {
        bridge = new Bridge(fungibleCurrency, bridgeConfig.anchors);
      }

      // If the selected chain is supported by the active wallet
      if (isSupported) {
        await switchChain(chain, activeWallet);
        setMainComponent(undefined);
        return;
      }

      toggleModal(true, chain);
    },
    [
      activeWallet,
      apiConfig.bridgeByAsset,
      chainsConfig,
      fungibleCurrency,
      onChange,
      setMainComponent,
      switchChain,
      toggleModal,
    ]
  );

  return (
    <ChainListCard
      chainType={chainType}
      chains={chains}
      className="w-full h-[710px]"
      currentActiveChain={currentActiveChain}
      defaultCategory={activeChain?.tag}
      onChange={handleChainChange}
      onClose={handleClose}
      isConnectingToChain={loading}
      {...props}
    />
  );
};
