'use client';

import { DropdownMenuTrigger as DropdownTrigger } from '@radix-ui/react-dropdown-menu';
import { ChainConfig } from '@webb-tools/dapp-config/chains/chain-config.interface';
import { ChainIcon } from '@webb-tools/icons/ChainIcon';
import ChainButton from '@webb-tools/webb-ui-components/components/buttons/ChainButton';
import {
  Dropdown,
  DropdownBody,
} from '@webb-tools/webb-ui-components/components/Dropdown';
import { MenuItem } from '@webb-tools/webb-ui-components/components/MenuItem';
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea';
import { FC } from 'react';

interface ChainSelectorProps {
  title: string;
  selectedChain: ChainConfig | null;
  chainOptions: ChainConfig[];
  onSelectChain: (chain: ChainConfig) => void;
  className?: string;
}

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

export default ChainSelector;
