'use client';

import { DropdownMenuTrigger as DropdownTrigger } from '@radix-ui/react-dropdown-menu';
import { ArrowRight } from '@webb-tools/icons/ArrowRight';
import ChainOrTokenButton from '@webb-tools/webb-ui-components/components/buttons/ChainOrTokenButton';
import {
  Dropdown,
  DropdownBody,
} from '@webb-tools/webb-ui-components/components/Dropdown';
import { FC, useCallback, useState } from 'react';

import { useBridge } from '../../context/BridgeContext';
import ChainList from './ChainList';
import TokenList from './TokenList';

const ChainSelectors: FC = () => {
  const {
    selectedSourceChain,
    selectedDestinationChain,
    setSelectedSourceChain,
    setSelectedDestinationChain,
    setAmount,
    selectedToken,
    setSelectedToken,
  } = useBridge();

  const [isSourceChainListOpen, setIsSourceChainListOpen] = useState(false);
  const [isDestinationChainListOpen, setIsDestinationChainListOpen] =
    useState(false);
  const [isTokenListOpen, setIsTokenListOpen] = useState(false);

  const onSwitchChains = useCallback(() => {
    const newSelectedDestinationChain = selectedSourceChain;
    const newSelectedSourceChain = selectedDestinationChain;

    setAmount(null);
    setSelectedSourceChain(newSelectedSourceChain);
    setSelectedDestinationChain(newSelectedDestinationChain);
  }, [
    setSelectedSourceChain,
    setSelectedDestinationChain,
    selectedDestinationChain,
    selectedSourceChain,
    setAmount,
  ]);

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-3">
      <Dropdown className="flex-1 w-full md:w-auto">
        <DropdownTrigger asChild>
          <ChainOrTokenButton
            value={selectedSourceChain.name}
            className="w-full !p-4 bg-mono-20 dark:bg-mono-160 border-0 hover:bg-mono-20 dark:hover:bg-mono-160"
            iconType="chain"
            onClick={() => setIsSourceChainListOpen(true)}
          />
        </DropdownTrigger>
        <DropdownBody className="p-0 border-0">
          <ChainList
            selectedChain="source"
            onClose={() => setIsSourceChainListOpen(false)}
            isOpen={isSourceChainListOpen}
          />
        </DropdownBody>
      </Dropdown>

      <div
        className="cursor-pointer p-1 rounded-full hover:bg-mono-20 dark:hover:bg-mono-160"
        onClick={onSwitchChains}
      >
        <ArrowRight size="lg" className="rotate-90 md:rotate-0" />
      </div>

      <Dropdown className="flex-1 w-full md:w-auto">
        <DropdownTrigger asChild>
          <ChainOrTokenButton
            value={selectedDestinationChain.name}
            className="w-full !p-4 bg-mono-20 dark:bg-mono-160 border-0 hover:bg-mono-20 dark:hover:bg-mono-160"
            iconType="chain"
            onClick={() => setIsDestinationChainListOpen(true)}
          />
        </DropdownTrigger>
        <DropdownBody className="p-0 border-0">
          <ChainList
            selectedChain="destination"
            onClose={() => setIsDestinationChainListOpen(false)}
            isOpen={isDestinationChainListOpen}
          />
        </DropdownBody>
      </Dropdown>

      <Dropdown className="flex-1 w-full md:w-auto">
        <DropdownTrigger asChild>
          <ChainOrTokenButton
            value={selectedToken?.symbol || 'Select Token'}
            className="w-full !p-4 bg-mono-20 dark:bg-mono-160 border-0 hover:bg-mono-20 dark:hover:bg-mono-160"
            iconType="token"
            onClick={() => setIsTokenListOpen(true)}
          />
        </DropdownTrigger>
        <DropdownBody className="p-0 border-0">
          <TokenList
            onClose={() => setIsTokenListOpen(false)}
            isOpen={isTokenListOpen}
          />
        </DropdownBody>
      </Dropdown>
    </div>
  );
};

export default ChainSelectors;
