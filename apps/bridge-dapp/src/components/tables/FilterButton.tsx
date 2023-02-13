import { chainsConfig } from '@webb-tools/dapp-config';
import { FilterIcon2, Search } from '@webb-tools/icons';
import {
  Accordion,
  AccordionButton,
  AccordionContent,
  AccordionItem,
  Button,
  CheckBoxMenuGroup,
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  Input,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useMemo } from 'react';
import { FilterButtonProps } from './types';

export const FilterButton: FC<FilterButtonProps> = ({
  destinationChains,
  setSelectedChains,
  selectedChains,
  searchPlaceholder,
  globalSearchText,
  setGlobalSearchText,
  clearAllFilters,
}) => {
  const chains = useMemo(() => {
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
          leftIcon={
            <FilterIcon2 className="!fill-current transition-transform duration-300 ease-in-out group-radix-state-open:rotate-180" />
          }
        >
          Filters
        </Button>
      </DropdownBasicButton>

      <DropdownBody className="min-w-[300px]" size="sm">
        <div className="flex items-center justify-between px-4 py-3">
          <Typography variant="h5" fw="bold">
            Filters
          </Typography>
          <Button
            variant="link"
            size="sm"
            className="uppercase"
            onClick={clearAllFilters}
          >
            Clear all
          </Button>
        </div>

        <div className="p-2">
          <Input
            id="search spend notes"
            placeholder={searchPlaceholder}
            rightIcon={<Search />}
            value={globalSearchText}
            onChange={setGlobalSearchText}
            debounceTime={300}
          />
        </div>

        <Accordion type={'single'} collapsible className="mb-2">
          <AccordionItem className={'p-0'} value={'chain'}>
            <AccordionButton>Destination Chain</AccordionButton>
            <AccordionContent className="p-2">
              <div className="max-w-[300px] max-h-[300px] overflow-x-hidden overflow-y-auto">
                <CheckBoxMenuGroup
                  value={selectedChains}
                  options={chains}
                  onChange={(v) => {
                    setSelectedChains(v);
                  }}
                  iconGetter={([_key, chainConfig]) => (
                    <div className="max-w-[20px] max-h-[20px] overflow-hidden ">
                      {<chainConfig.logo />}
                    </div>
                  )}
                  labelGetter={([_, chain]: any) => chain.name}
                  keyGetter={([chainId]) => `Filter_proposals${chainId}`}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </DropdownBody>
    </Dropdown>
  );
};
