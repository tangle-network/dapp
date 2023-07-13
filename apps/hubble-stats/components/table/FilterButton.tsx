import { FC, useMemo } from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionContent,
  AccordionItem,
  Button,
  ChainChip,
  CheckBoxMenuGroup,
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
} from '@webb-tools/webb-ui-components';
import { TokenIcon, ChevronDown } from '@webb-tools/icons';
import { chainsConfig } from '@webb-tools/dapp-config/chains';

import { FilterButtonProps } from './types';

const FilterButton: FC<FilterButtonProps> = ({
  tokens,
  selectedTokens,
  setSelectedTokens,
  sourceChains,
  selectedSourceChains,
  setSelectedSourceChains,
  destinationChains,
  selectedDestinationChains,
  setSelectedDestinationChains,
  showAllFn,
}) => {
  const sourceChainOptions = useMemo(() => {
    return Object.keys(chainsConfig)
      .map((key: any) => [String(key), chainsConfig[key]])
      .filter((val: any) => sourceChains.includes(val['1'].name));
  }, [sourceChains]);

  const destinationChainOptions = useMemo(() => {
    return Object.keys(chainsConfig)
      .map((key: any) => [String(key), chainsConfig[key]])
      .filter((val: any) => destinationChains.includes(val['1'].name));
  }, [destinationChains]);

  return (
    <Dropdown>
      <DropdownBasicButton className="group">
        <Button
          as="span"
          variant="utility"
          size="sm"
          rightIcon={
            <ChevronDown className="!fill-current transition-transform duration-300 ease-in-out group-radix-state-open:rotate-180" />
          }
        >
          Filters
        </Button>
      </DropdownBasicButton>

      <DropdownBody className="min-w-[300px] pb-4" size="sm">
        {/* Token */}
        <Accordion
          type="multiple"
          defaultValue={['token']}
          className="pt-4 pb-2 px-4"
        >
          <AccordionItem
            value="token"
            className="p-0 border-b border-mono-40 dark:border-mono-140"
          >
            <AccordionButton className="px-0">Token</AccordionButton>
            <AccordionContent className="p-0">
              <CheckBoxMenuGroup
                value={selectedTokens}
                options={tokens}
                onChange={(v) => {
                  setSelectedTokens(v);
                }}
                iconGetter={([_key, name]) => <TokenIcon name={name} />}
                labelGetter={([_, name]) => name}
                keyGetter={([tokenId]) => `Filter_proposals${tokenId}`}
                className="px-0"
                labelClassName="!pl-0"
              />
            </AccordionContent>
          </AccordionItem>

          {/* Source Chain */}
          <AccordionItem
            value="source-chain"
            className="p-0 border-b border-mono-40 dark:border-mono-140"
          >
            <AccordionButton className="px-0">Source Chain</AccordionButton>
            <AccordionContent className="p-0">
              <CheckBoxMenuGroup
                value={selectedSourceChains}
                options={sourceChainOptions}
                onChange={(chains) => {
                  setSelectedSourceChains(chains);
                }}
                labelGetter={([_, chain]: any) => (
                  <ChainChip chainName={chain.name} chainType={chain.base} />
                )}
                keyGetter={([chainId]) => `Filter_proposals${chainId}`}
                className="px-0"
                labelClassName="!pl-0"
              />
            </AccordionContent>
          </AccordionItem>

          {/* Destination Chain */}
          <AccordionItem value="destination-chain" className="p-0">
            <AccordionButton className="px-0">
              Destination Chain
            </AccordionButton>
            <AccordionContent className="p-0">
              <CheckBoxMenuGroup
                value={selectedDestinationChains}
                options={destinationChainOptions}
                onChange={(chains) => {
                  setSelectedDestinationChains(chains);
                }}
                labelGetter={([_, chain]: any) => (
                  <ChainChip chainName={chain.name} chainType={chain.base} />
                )}
                keyGetter={([chainId]) => `Filter_proposals${chainId}`}
                className="px-0"
                labelClassName="!pl-0"
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button
          variant="link"
          size="sm"
          onClick={showAllFn}
          className="uppercase ml-auto mr-4"
        >
          show all
        </Button>
      </DropdownBody>
    </Dropdown>
  );
};

export default FilterButton;
