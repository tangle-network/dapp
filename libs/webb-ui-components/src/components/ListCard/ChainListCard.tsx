import { ChainIcon, InformationLine, Search } from '@webb-tools/icons';
import cx from 'classnames';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { Typography } from '../../typography';
import { Button } from '../Button';
import { Chip } from '../Chip';
import { Input } from '../Input';
import { ScrollArea } from '../ScrollArea';
import { ListCardWrapper } from './ListCardWrapper';
import { ListItem } from './ListItem';
import { ChainListCardProps, ChainType } from './types';
import { RadioGroup, RadioItem } from '../Radio';

export const ChainListCard = forwardRef<HTMLDivElement, ChainListCardProps>(
  (
    {
      chains,
      chainType,
      currentActiveChain,
      defaultCategory = 'test',
      onChange,
      onClose,
      onlyCategory,
      overrideScrollAreaProps,
      value: selectedChain,
      ...props
    },
    ref
  ) => {
    // State for network category
    const [networkCategory, setNetworkCategory] = useState<ChainType['tag']>(
      onlyCategory ?? defaultCategory
    );

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
        setChain(nextChain);
        onChange?.(nextChain);
      },
      [onChange, setChain]
    );

    const filteredChains = useMemo(
      () =>
        chains
          .filter(
            (c) =>
              c.name.toLowerCase().includes(searchText.toLowerCase()) ||
              c.symbol.toLowerCase().includes(searchText.toLowerCase())
          ) // Filter by search text
          .filter((chain) => chain.tag === networkCategory), // Filter by network category
      [chains, searchText, networkCategory]
    );

    return (
      <ListCardWrapper
        {...props}
        className={twMerge('flex flex-col', props.className)}
        title={`Select ${
          chainType === 'source' ? 'Source' : 'Destination'
        } Chain`}
        onClose={onClose}
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
          />
        </div>

        {/** Token list */}
        <ScrollArea
          {...overrideScrollAreaProps}
          className={twMerge(
            'min-w-[350px] h-[376px]',
            overrideScrollAreaProps?.className
          )}
        >
          <ul className="py-2">
            {filteredChains.map((currentChain, idx) => {
              const isConnected =
                chainType === 'source' &&
                currentChain.name === currentActiveChain;

              return (
                <ListItem
                  key={`${currentChain.name}-${currentChain.symbol}${idx}`}
                  className="flex items-center justify-between"
                  onClick={() => onChainChange(currentChain)}
                >
                  <div className="flex items-center space-x-2">
                    <ChainIcon
                      isActive={isConnected}
                      size="lg"
                      name={currentChain.name}
                    />

                    <Typography
                      variant="body1"
                      fw="bold"
                      className="capitalize cursor-default"
                    >
                      {currentChain.name}
                    </Typography>
                  </div>

                  {!isConnected && (
                    <div className="hidden group-hover:block">
                      <Button variant="link" size="sm">
                        Select
                      </Button>
                    </div>
                  )}

                  {isConnected && (
                    <Chip className="cursor-default" color="yellow">
                      Connected
                    </Chip>
                  )}
                </ListItem>
              );
            })}
          </ul>
        </ScrollArea>

        <div className="mt-auto">
          {/** Disclamer */}
          <div
            className={cx(
              'flex w-full px-4 py-2 space-x-1 border rounded-lg',
              'text-blue-70 dark:text-blue-50',
              'bg-blue-10/50 dark:bg-blue-120 border-blue-10 dark:border-blue-90'
            )}
          >
            <InformationLine size="lg" className="!fill-current" />

            <Typography
              variant="body1"
              fw="semibold"
              component="p"
              className="!text-current"
            >
              The selection of source chain will determine tokens and
              destination chains availability.
            </Typography>
          </div>

          {/** Network categories */}
          <RadioGroup
            defaultValue={networkCategory}
            value={networkCategory}
            onValueChange={(val) => setNetworkCategory(val as ChainType['tag'])}
            className="flex items-center justify-center py-4 space-x-4"
          >
            <RadioItem
              id="live"
              value="live"
              overrideRadixRadioItemProps={{
                disabled: onlyCategory && onlyCategory !== 'live',
              }}
            >
              Live
            </RadioItem>

            <RadioItem
              id="test"
              value="test"
              overrideRadixRadioItemProps={{
                disabled: onlyCategory && onlyCategory !== 'test',
              }}
            >
              Testnet
            </RadioItem>

            <RadioItem
              id="dev"
              value="dev"
              overrideRadixRadioItemProps={{
                disabled: onlyCategory && onlyCategory !== 'dev',
              }}
            >
              Development
            </RadioItem>
          </RadioGroup>
        </div>
      </ListCardWrapper>
    );
  }
);
