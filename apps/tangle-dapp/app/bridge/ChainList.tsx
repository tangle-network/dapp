'use client';

import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import ChainListCard from '@webb-tools/webb-ui-components/components/ListCard/ChainListCard';
import { type ComponentProps, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { useBridge } from '../../context/BridgeContext';

type Props = Partial<ComponentProps<typeof ChainListCard>> & {
  selectedChain: 'source' | 'destination';
};

const ChainList = ({ className, onClose, selectedChain, ...props }: Props) => {
  const {
    selectedSourceChain,
    selectedDestinationChain,
    sourceChainOptions,
    destinationChainOptions,
    setSelectedSourceChain,
    setSelectedDestinationChain,
  } = useBridge();

  const chains = useMemo(
    () =>
      (selectedChain === 'source'
        ? sourceChainOptions
        : destinationChainOptions
      ).map((chain) => ({
        typedChainId: calculateTypedChainId(chain.chainType, chain.id),
        name: chain.name,
        tag: chain.tag,
        needSwitchWallet: false,
      })),
    [selectedChain, sourceChainOptions, destinationChainOptions],
  );

  const activeChain =
    selectedChain === 'source' ? selectedSourceChain : selectedDestinationChain;

  const handleChange = (chain: (typeof chains)[number]) => {
    const selectedChainConfig =
      selectedChain === 'source' ? sourceChainOptions : destinationChainOptions;
    const newChain = selectedChainConfig.find(
      (c) => calculateTypedChainId(c.chainType, c.id) === chain.typedChainId,
    );
    if (newChain) {
      if (selectedChain === 'source') {
        setSelectedSourceChain(newChain);
      } else {
        setSelectedDestinationChain(newChain);
      }
    }
    onClose?.();
  };

  return (
    <ChainListCard
      chainType={selectedChain === 'destination' ? 'source' : 'dest'}
      disclaimer=""
      overrideTitleProps={{
        variant: 'h4',
      }}
      chains={chains}
      activeTypedChainId={calculateTypedChainId(
        activeChain.chainType,
        activeChain.id,
      )}
      defaultCategory={activeChain.tag}
      isConnectingToChain={false}
      onChange={handleChange}
      {...props}
      onClose={onClose}
      className={twMerge(
        'h-full mx-auto dark:bg-[var(--restake-card-bg-dark)]',
        className,
      )}
    />
  );
};

ChainList.displayName = 'ChainList';

export default ChainList;
