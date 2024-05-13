'use client';

import { DropdownMenuTrigger as DropdownTrigger } from '@radix-ui/react-dropdown-menu';
import { ChainConfig } from '@webb-tools/dapp-config/chains/chain-config.interface';
import { ArrowRight } from '@webb-tools/icons/ArrowRight';
import { ChainIcon } from '@webb-tools/icons/ChainIcon';
import ChainButton from '@webb-tools/webb-ui-components/components/buttons/ChainButton';
import {
  Dropdown,
  DropdownBody,
} from '@webb-tools/webb-ui-components/components/Dropdown';
import { MenuItem } from '@webb-tools/webb-ui-components/components/MenuItem';
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea';
import { FC, useCallback } from 'react';

import { useBridge } from '../../context/BridgeContext';

interface ChainSelectorProps {
  title: string;
  selectedChain: ChainConfig | null;
  chainOptions: ChainConfig[];
  onSelectChain: (chain: ChainConfig) => void;
  className?: string;
}

const ChainSelectors: FC = () => {
  const {
    sourceChain,
    setSourceChain,
    destinationChain,
    setDestinationChain,
    supportedSourceChains,
    supportedDestinationChains,
  } = useBridge();

  const onSetSourceChain = useCallback(
    (chain: ChainConfig) => {
      setSourceChain(chain);
      // If the source chain is the same as the destination chain, clear the destination chain.
      if (chain.id === destinationChain?.id) {
        setDestinationChain(null);
      }
    },
    [destinationChain?.id, setDestinationChain, setSourceChain]
  );

  const onSetDestinationChain = useCallback(
    (chain: ChainConfig) => {
      setDestinationChain(chain);
      // If the destination chain is the same as the source chain, clear the source chain.
      if (chain.id === sourceChain?.id) {
        setSourceChain(null);
      }
    },
    [setDestinationChain, setSourceChain, sourceChain?.id]
  );

  const switchChains = useCallback(() => {
    const temp = sourceChain;

    if (
      temp === null ||
      supportedDestinationChains.find((chain) => chain.id === temp.id)
    ) {
      setDestinationChain(temp);
    } else {
      setDestinationChain(null);
    }

    if (
      destinationChain === null ||
      supportedSourceChains.find((chain) => chain.id === destinationChain.id)
    ) {
      setSourceChain(destinationChain);
    } else {
      setSourceChain(null);
    }
  }, [
    setSourceChain,
    setDestinationChain,
    destinationChain,
    sourceChain,
    supportedDestinationChains,
    supportedSourceChains,
  ]);

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-3">
      <ChainSelector
        title="From"
        selectedChain={sourceChain}
        chainOptions={supportedSourceChains}
        onSelectChain={onSetSourceChain}
        className="flex-1 w-full md:w-auto"
      />

      <div
        className="cursor-pointer p-1 rounded-full hover:bg-mono-20 dark:hover:bg-mono-160"
        onClick={switchChains}
      >
        <ArrowRight size="lg" className="rotate-90 md:rotate-0" />
      </div>

      <ChainSelector
        title="To"
        selectedChain={destinationChain}
        chainOptions={supportedDestinationChains}
        onSelectChain={onSetDestinationChain}
        className="flex-1 w-full md:w-auto"
      />
    </div>
  );
};

const ChainSelector: FC<ChainSelectorProps> = ({
  title,
  selectedChain,
  chainOptions,
  onSelectChain,
  className,
}) => {
  return (
    <Dropdown className={className}>
      <DropdownTrigger asChild>
        <ChainButton
          chain={selectedChain ?? undefined}
          status="success"
          placeholder={selectedChain === null ? title : undefined}
          className="w-full bg-mono-20 dark:bg-mono-160 border-0"
          textClassName={
            selectedChain === null ? 'text-mono-100 dark:text-mono-80' : ''
          }
        />
      </DropdownTrigger>
      <DropdownBody>
        <ScrollArea className="max-h-[300px]">
          <ul>
            {chainOptions.map((chain) => {
              return (
                <li key={`${chain.chainType}-${chain.id}`}>
                  <MenuItem
                    startIcon={<ChainIcon size="lg" name={chain.name} />}
                    onSelect={() => onSelectChain(chain)}
                  >
                    {chain.name}
                  </MenuItem>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </DropdownBody>
    </Dropdown>
  );
};

export default ChainSelectors;
