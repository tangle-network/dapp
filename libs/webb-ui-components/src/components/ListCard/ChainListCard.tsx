import { Search, TokenIcon } from '@webb-tools/icons';
import { Typography } from '../../typography';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '../Button';
import { Chip } from '../Chip';
import { Input } from '../Input';
import { ScrollArea } from '../ScrollArea';
import { ListCardWrapper } from './ListCardWrapper';
import { ListItem } from './ListItem';
import { ChainListCardProps, ChainType } from './types';

export const ChainListCard = forwardRef<HTMLDivElement, ChainListCardProps>(
  (
    { chainType, chains, onChange, onClose, value: selectedChain, ...props },
    ref
  ) => {
    const [chain, setChain] = useState<ChainType | undefined>(selectedChain);

    // Search text
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
      let subscribe = true;

      if (subscribe) {
        setChain(selectedChain);
      }

      return () => {
        subscribe = false;
      };
    }, [selectedChain, setChain]);

    const onChainChange = useCallback(
      (nextChain: ChainType) => {
        console.log('chainListCard onChainChange fired!!!');
        setChain(nextChain);
        onChange?.(nextChain);
      },
      [onChange, setChain]
    );

    const filteredChains = useMemo(
      () =>
        chains.filter(
          (c) =>
            c.name.toLowerCase().includes(searchText.toLowerCase()) ||
            c.symbol.toLowerCase().includes(searchText.toLowerCase())
        ),
      [chains, searchText]
    );

    return (
      <ListCardWrapper
        {...props}
        title={`Select ${
          chainType === 'source' ? 'Source' : 'Destination'
        } Chain`}
        onClose={onClose}
        ref={ref}
      >
        {/** The search input */}
        <div className="px-2 py-4">
          <Input
            id="chain"
            rightIcon={<Search />}
            placeholder="Search chains"
            value={searchText}
            onChange={(val) => setSearchText(val.toString())}
          />
        </div>

        {/** Token list */}
        <ScrollArea className="min-w-[350px] h-[376px]">
          <ul className="p-2">
            {filteredChains.map((currentChain, idx) => {
              const isSelected =
                currentChain.name === chain?.name &&
                currentChain.symbol === chain?.symbol;

              return (
                <ListItem
                  key={`${currentChain.name}-${currentChain.symbol}${idx}`}
                  className="flex items-center justify-between"
                  onClick={() => onChainChange(currentChain)}
                >
                  <div className="flex items-center space-x-2">
                    <TokenIcon
                      isActive={isSelected}
                      size="lg"
                      name={currentChain.symbol.toLowerCase()}
                    />

                    <Typography
                      variant="body1"
                      fw="bold"
                      className="capitalize"
                    >
                      {currentChain.name}
                    </Typography>
                  </div>

                  {!isSelected && (
                    <div className="hidden group-hover:block">
                      <Button variant="link" size="sm">
                        Select
                      </Button>
                    </div>
                  )}

                  {isSelected && <Chip color="yellow">Connected</Chip>}
                </ListItem>
              );
            })}
          </ul>
        </ScrollArea>
      </ListCardWrapper>
    );
  }
);
