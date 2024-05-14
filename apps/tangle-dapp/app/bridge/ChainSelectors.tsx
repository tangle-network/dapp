'use client';

import { DropdownMenuTrigger as DropdownTrigger } from '@radix-ui/react-dropdown-menu';
import { ChainConfig } from '@webb-tools/dapp-config/chains/chain-config.interface';
import { ArrowRight } from '@webb-tools/icons/ArrowRight';
import { ChainIcon } from '@webb-tools/icons/ChainIcon';
import DropdownButton from '@webb-tools/webb-ui-components/components/buttons/DropdownButton';
import {
  Dropdown,
  DropdownBody,
} from '@webb-tools/webb-ui-components/components/Dropdown';
import { MenuItem } from '@webb-tools/webb-ui-components/components/MenuItem';
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea';
import { FC, useCallback } from 'react';

import { useBridge } from '../../context/BridgeContext';

interface ChainSelectorProps {
  selectedChain: ChainConfig;
  chainOptions: ChainConfig[];
  onSelectChain: (chain: ChainConfig) => void;
  className?: string;
}

const ChainSelectors: FC = () => {
  const {
    selectedSourceChain,
    setSelectedSourceChain,
    selectedDestinationChain,
    setSelectedDestinationChain,
    sourceChainOptions,
    destinationChainOptions,
  } = useBridge();

  const switchChains = useCallback(() => {
    const temp = selectedSourceChain;
    setSelectedDestinationChain(temp);
    setSelectedSourceChain(selectedDestinationChain);
  }, [
    setSelectedSourceChain,
    setSelectedDestinationChain,
    selectedDestinationChain,
    selectedSourceChain,
  ]);

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-3">
      <ChainSelector
        selectedChain={selectedSourceChain}
        chainOptions={sourceChainOptions}
        onSelectChain={setSelectedSourceChain}
        className="flex-1 w-full md:w-auto"
      />

      <div
        className="cursor-pointer p-1 rounded-full hover:bg-mono-20 dark:hover:bg-mono-160"
        onClick={switchChains}
      >
        <ArrowRight size="lg" className="rotate-90 md:rotate-0" />
      </div>

      <ChainSelector
        selectedChain={selectedDestinationChain}
        chainOptions={destinationChainOptions}
        onSelectChain={setSelectedDestinationChain}
        className="flex-1 w-full md:w-auto"
      />
    </div>
  );
};

const ChainSelector: FC<ChainSelectorProps> = ({
  selectedChain,
  chainOptions,
  onSelectChain,
  className,
}) => {
  return (
    <Dropdown className={className}>
      <DropdownTrigger asChild>
        <DropdownButton
          value={selectedChain.name}
          className="w-full bg-mono-20 dark:bg-mono-160 border-0"
          iconType="chain"
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
