import { FC } from 'react';
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

import { TableFilterButtonProps } from './types';

const TableFilterButton: FC<TableFilterButtonProps> = ({
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
        <Accordion type="multiple" defaultValue={[]} className="pt-4 pb-2 px-4">
          <AccordionItem
            value="token"
            className="p-0 border-b border-mono-40 dark:border-mono-140"
          >
            <AccordionButton className="px-0">Token</AccordionButton>
            <AccordionContent className="p-0">
              <CheckBoxMenuGroup
                value={selectedTokens}
                options={tokens}
                onChange={(tokens) => {
                  setSelectedTokens(tokens as [number, string][]);
                }}
                iconGetter={([_, name]) => <TokenIcon name={name} size="lg" />}
                labelGetter={([_, name]) => name}
                keyGetter={([tokenId]) => tokenId.toString()}
                className="px-0"
                labelClassName="uppercase"
                showAllLabel={false}
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
                options={sourceChains}
                onChange={(chains) => {
                  setSelectedSourceChains(chains as number[]);
                }}
                labelGetter={(typedChainId) => (
                  <ChainChip
                    chainName={chainsConfig[typedChainId].name}
                    chainType={chainsConfig[typedChainId].group}
                  />
                )}
                keyGetter={(typedChainId) => typedChainId.toString()}
                className="px-0"
                labelClassName="!pl-0"
                showAllLabel={false}
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
                options={destinationChains}
                onChange={(chains) => {
                  setSelectedDestinationChains(chains as number[]);
                }}
                labelGetter={(typedChainId) => (
                  <ChainChip
                    chainName={chainsConfig[typedChainId].name}
                    chainType={chainsConfig[typedChainId].group}
                  />
                )}
                keyGetter={(typedChainId) => typedChainId.toString()}
                className="px-0"
                labelClassName="!pl-0"
                showAllLabel={false}
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

export default TableFilterButton;
