import { useState, useMemo, forwardRef } from 'react';
import { ExternalLinkLine, Search } from '@webb-tools/icons';
import { ScrollArea } from '../ScrollArea';
import { Typography } from '../../typography';
import SkeletonLoader from '../SkeletonLoader';
import { Input } from '../Input';
import { ListItem } from './ListItem';
import { ListCardWrapper } from './ListCardWrapper';
import { isHex } from 'viem';

import { ContractListCardProps } from './types';
import { shortenHex, shortenString } from '../../utils';

const ContractListCard = forwardRef<HTMLDivElement, ContractListCardProps>(
  ({ isLoading, selectContractItems, ...props }, ref) => {
    const [searchText, setSearchText] = useState('');

    const filterList = useMemo(
      () =>
        selectContractItems.filter((item) => {
          return (
            item.name.toLowerCase().includes(searchText.toLowerCase()) ||
            item.address.toLowerCase().includes(searchText.toLowerCase()) ||
            item.blockExplorerUrl
              ?.toLowerCase()
              .includes(searchText.toLowerCase())
          );
        }),
      [selectContractItems, searchText]
    );

    return (
      <ListCardWrapper
        title="Select Contract"
        hideCloseButton
        {...props}
        ref={ref}
      >
        {/** The search input */}
        <div className="py-4">
          <Input
            id="chain"
            rightIcon={<Search />}
            placeholder="Search chains"
            value={searchText}
            onChange={(val) => setSearchText(val.toString())}
            isDisabled={isLoading || selectContractItems.length === 0}
          />
        </div>

        <ScrollArea className="lg:min-w-[350px] h-[376px]">
          {isLoading && (
            <div className="space-y-2">
              <SkeletonLoader size="xl" />
              <SkeletonLoader size="xl" />
            </div>
          )}
          {!isLoading && (
            <ul className="py-2">
              {filterList.map((item, idx) => {
                const { name, address, blockExplorerUrl, onSelectContract } =
                  item;
                return (
                  <ListItem
                    key={idx}
                    className="flex justify-between"
                    onClick={() => {
                      onSelectContract && onSelectContract();
                    }}
                  >
                    <div>
                      <Typography
                        component="span"
                        variant="h5"
                        fw="bold"
                        className="block cursor-default"
                      >
                        {name}
                      </Typography>
                      <Typography
                        component="span"
                        variant="body1"
                        fw="bold"
                        className="cursor-default text-mono-100 dark:text-mono-80"
                      >
                        {isHex(address)
                          ? shortenHex(address)
                          : shortenString(address)}
                      </Typography>
                    </div>

                    {typeof blockExplorerUrl === 'string' && (
                      <a
                        href={blockExplorerUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="!text-inherit"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <ExternalLinkLine className="inline-block !fill-current" />
                      </a>
                    )}
                  </ListItem>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </ListCardWrapper>
    );
  }
);

export default ContractListCard;
