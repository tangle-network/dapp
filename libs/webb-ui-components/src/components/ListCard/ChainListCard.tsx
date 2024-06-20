'use client';

import { ChainIcon, Search } from '@webb-tools/icons';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography';
import { Alert } from '../Alert';
import { Chip } from '../Chip';
import { Input } from '../Input';
import { RadioGroup, RadioItem } from '../Radio';
import { ScrollArea } from '../ScrollArea';
import { Button } from '../buttons';
import { ListCardWrapper } from './ListCardWrapper';
import { ListItem } from './ListItem';
import { ChainListCardProps, ChainType } from './types';

/**
 * The ChainListCard component is used to display a list of chains.
 *
 * Props:
 * - `chains`: The list of chains to display.
 * - `chainType`: The type of chain to display.
 * - `currentActiveChain`: The current active chain.
 * - `defaultCategory`: The default category to display.
 * - `onChange`: The callback function when the chain is changed.
 * - `onClose`: The callback function when the card is closed.
 * - `onlyCategory`: The category to display.
 * - `overrideScrollAreaProps`: The props to override the scroll area.
 * - `isConnectingToChain`: Whether the chain is connecting.
 * - `value`: The selected chain.
 *
 * @example
 * ```tsx
 * <ChainListCard
 *  chains={chains}
 *  chainType="source"
 *  currentActiveChain={currentActiveChain}
 *  defaultCategory="test"
 *  onChange={setSourceChain}
 *  onClose={() => setShowSourceChainList(false)}
 *  onlyCategory="test"
 * />
 * ```
 */
const ChainListCard = forwardRef<HTMLDivElement, ChainListCardProps>(
  (
    {
      chains,
      chainType,
      activeTypedChainId,
      defaultCategory = 'test',
      onChange,
      onClose,
      onlyCategory,
      overrideScrollAreaProps,
      isConnectingToChain,
      value: selectedChain,
      ...props
    },
    ref,
  ) => {
    // State for network category
    const [networkCategory, setNetworkCategory] = useState<ChainType['tag']>(
      () => onlyCategory ?? defaultCategory,
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
    }, [selectedChain]);

    const onChainChange = useCallback(
      (nextChain: ChainType) => {
        setChain(nextChain);
        onChange?.(nextChain);
      },
      [onChange],
    );

    const filteredChains = useMemo(
      () =>
        chains
          .filter((c) =>
            c.name.toLowerCase().includes(searchText.toLowerCase()),
          ) // Filter by search text
          .filter((chain) => chain.tag === networkCategory), // Filter by network category
      [chains, searchText, networkCategory],
    );

    // Move the current active chain to the top of the list
    const sortedChains = useMemo(() => {
      if (!activeTypedChainId) {
        return filteredChains.sort((a, b) => a.name.localeCompare(b.name));
      }

      const currentActiveChainIndex = filteredChains.findIndex(
        (chain) => chain.typedChainId === activeTypedChainId,
      );

      if (currentActiveChainIndex === -1) {
        return filteredChains.sort((a, b) => a.name.localeCompare(b.name));
      }

      const activeChain = filteredChains[currentActiveChainIndex];

      return [
        activeChain,
        ...filteredChains
          .filter((chain) => chain.name !== activeChain.name)
          .sort((a, b) => a.name.localeCompare(b.name)),
      ];
    }, [activeTypedChainId, filteredChains]);

    // Count the number of chains in each category
    const [liveCount, devCount, testCount] = useMemo(
      () => [
        chains.filter((chain) => chain.tag === 'live').length,
        chains.filter((chain) => chain.tag === 'dev').length,
        chains.filter((chain) => chain.tag === 'test').length,
      ],
      [chains],
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

        {/** Chain list */}
        <ScrollArea
          {...overrideScrollAreaProps}
          className={twMerge(
            'lg:min-w-[350px] h-[376px]',
            overrideScrollAreaProps?.className,
          )}
        >
          <ul className="py-2">
            {sortedChains.map((currentChain, idx) => {
              const isConnected =
                chainType === 'source' &&
                currentChain.typedChainId === activeTypedChainId;

              const isSelectedToConnect = chain?.name === currentChain.name;

              return (
                <ListItem
                  key={`${currentChain.name}-${idx}`}
                  className="flex items-center justify-between"
                  onClick={() => onChainChange(currentChain)}
                >
                  <div className="flex items-center space-x-2">
                    <ChainIcon
                      status={
                        isConnected && !isConnectingToChain
                          ? 'success'
                          : undefined
                      }
                      size="lg"
                      name={currentChain.name}
                    />

                    <Typography
                      variant="h5"
                      fw="bold"
                      className="capitalize cursor-default"
                    >
                      {currentChain.name}
                    </Typography>
                  </div>

                  {isConnectingToChain && isSelectedToConnect ? (
                    <Chip className="cursor-default" color="yellow">
                      Connecting
                    </Chip>
                  ) : null}

                  {!isConnected && !isConnectingToChain ? (
                    <div className="hidden group-hover:block">
                      <Button variant="link" size="sm">
                        {currentChain.needSwitchWallet
                          ? 'Switch wallet'
                          : 'Select'}
                      </Button>
                    </div>
                  ) : null}

                  {isConnected && !isConnectingToChain ? (
                    <Chip className="cursor-default" color="green">
                      Connected
                    </Chip>
                  ) : null}
                </ListItem>
              );
            })}
          </ul>
        </ScrollArea>

        <div className="mt-7">
          {/** Disclamer */}
          <Alert
            title="The selection of source chain will determine tokens and
              destination chains availability."
          />

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
                disabled:
                  (onlyCategory && onlyCategory !== 'live') || !liveCount, // Disable if there are no live chains
              }}
            >
              Live
            </RadioItem>

            <RadioItem
              id="test"
              value="test"
              overrideRadixRadioItemProps={{
                disabled:
                  (onlyCategory && onlyCategory !== 'test') || !testCount, // Disable if there are no test chains
              }}
            >
              Testnet
            </RadioItem>

            <RadioItem
              id="dev"
              value="dev"
              overrideRadixRadioItemProps={{
                disabled: (onlyCategory && onlyCategory !== 'dev') || !devCount, // Disable if there are no dev chains
              }}
            >
              Development
            </RadioItem>
          </RadioGroup>
        </div>
      </ListCardWrapper>
    );
  },
);

export default ChainListCard;
