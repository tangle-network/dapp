import { useWebContext } from '@webb-tools/api-provider-environment';
import { currenciesConfig } from '@webb-tools/dapp-config';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { ChainListCard, useWebbUI } from '@webb-tools/webb-ui-components';
import { FC, useCallback, useMemo } from 'react';

import { useConnectWallet } from '../../hooks';
import { ChainListCardWrapperProps } from './types';

/**
 * The wrapper component for the ChainListCard component
 * to share the common props and logic
 */
export const ChainListCardWrapper: FC<ChainListCardWrapperProps> = ({
  chains: chainsProps,
  chainType = 'source',
  currentActiveChain: currentActiveChainProps,
  onChange,
  onClose,
  ...props
}) => {
  const { setMainComponent } = useWebbUI();

  const { toggleModal } = useConnectWallet();

  const {
    activeChain,
    activeWallet,
    chains: chainsConfig,
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

    return Object.values(chainsConfig).map((val) => {
      return {
        name: val.name,
        tag: val.tag,
        symbol: currenciesConfig[val.nativeCurrencyId].symbol,
      };
    });
  }, [chainsConfig, chainsProps]);

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
          calculateTypedChainId(chain.chainType, chain.chainId)
        );

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
      chainsConfig,
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
      className="min-w-[550px] w-full h-[700px]"
      currentActiveChain={currentActiveChain}
      onChange={handleChainChange}
      onClose={handleClose}
      {...props}
    />
  );
};
