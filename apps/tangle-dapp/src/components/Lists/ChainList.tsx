import { useWebContext } from '@tangle-network/api-provider-environment/webb-context';
import { Chain, ChainConfig } from '@tangle-network/dapp-config';
import { ChainIcon, Search } from '@tangle-network/icons';
import {
  Chip,
  Input,
  ListItem,
  Typography,
  Switcher,
} from '@tangle-network/ui-components';
import { ScrollArea } from '@tangle-network/ui-components/components/ScrollArea';
import { ComponentProps, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Nullable } from '@tangle-network/dapp-types/utils/types';
import { Maybe } from '@tangle-network/dapp-types/utils/types';
import useLocalStorage, {
  LocalStorageKey,
} from '@tangle-network/tangle-shared-ui/hooks/useLocalStorage';

import { ListCardWrapper } from './ListCardWrapper';

type ChainListProps = {
  searchInputId: string;
  showSearchInput?: boolean;
  chainType: 'source' | 'destination';
  title?: string;
  onClose: () => void;
  chains: ChainConfig[];
  onSelectChain: (chain: ChainConfig) => void;
  overrideScrollAreaProps?: ComponentProps<typeof ScrollArea>;
  disableSelectedChain?: boolean;
  groupByChainType?: boolean;
};

export const ChainList = ({
  searchInputId,
  // There's usually a small amount of chains, so avoid
  // showing the search input by default.
  showSearchInput = false,
  chains,
  onClose,
  title = 'Select Network',
  overrideScrollAreaProps,
  onSelectChain,
  chainType,
  disableSelectedChain = false,
  groupByChainType = false,
}: ChainListProps) => {
  const [searchText, setSearchText] = useState('');
  const { valueOpt: showTestNetworksOpt, set: setShowTestNetworks } =
    useLocalStorage(LocalStorageKey.SHOW_TEST_NETWORKS);
  const showTestNetworks = showTestNetworksOpt?.value ?? false;

  const filteredChains = useMemo(() => {
    return chains.filter((chain) =>
      chain.name.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [chains, searchText]);

  const { activeChain } = useWebContext();

  const groupedChains = useMemo(() => {
    if (!groupByChainType) return { liveChains: [], testChains: [] };

    return {
      liveChains: filteredChains.filter((chain) => chain.tag === 'live'),
      testChains: filteredChains.filter((chain) => chain.tag === 'test'),
    };
  }, [filteredChains, groupByChainType]);

  return (
    <ListCardWrapper title={title} onClose={onClose}>
      {showSearchInput && (
        <div className="px-4 md:px-6 pb-5">
          <Input
            id={searchInputId}
            isControlled
            rightIcon={<Search />}
            placeholder="Search chains"
            value={searchText}
            onChange={setSearchText}
            inputClassName="placeholder:text-mono-80 dark:placeholder:text-mono-120"
          />
        </div>
      )}
      {!groupByChainType && (
        <DisplayChains
          chains={filteredChains}
          chainType={chainType}
          activeChain={activeChain}
          disableSelectedChain={disableSelectedChain}
          onSelectChain={onSelectChain}
          onClose={onClose}
        />
      )}

      {groupByChainType && (
        <>
          <DisplayChains
            chains={groupedChains.liveChains}
            chainType={chainType}
            activeChain={activeChain}
            disableSelectedChain={disableSelectedChain}
            onSelectChain={onSelectChain}
            onClose={onClose}
            overrideScrollAreaProps={overrideScrollAreaProps}
          />

          <div className="flex items-center justify-between px-6 py-4 mt-4 border-t border-mono-40 dark:border-mono-170">
            <Typography variant="body1" fw="medium" className="capitalize">
              Show test networks
            </Typography>
            <Switcher
              checked={showTestNetworks}
              onCheckedChange={(checked) => setShowTestNetworks(checked)}
            />
          </div>

          {showTestNetworks && (
            <DisplayChains
              chains={groupedChains.testChains}
              chainType={chainType}
              activeChain={activeChain}
              disableSelectedChain={disableSelectedChain}
              onSelectChain={onSelectChain}
              onClose={onClose}
              overrideScrollAreaProps={{
                ...overrideScrollAreaProps,
                className: 'border-none pt-0',
              }}
            />
          )}
        </>
      )}
    </ListCardWrapper>
  );
};

const DisplayChains = ({
  chains,
  overrideScrollAreaProps,
  chainType,
  activeChain,
  disableSelectedChain,
  onSelectChain,
  onClose,
}: {
  chains: ChainConfig[];
  chainType: 'source' | 'destination';
  activeChain: Nullable<Maybe<Chain>>;
  disableSelectedChain: boolean;
  onSelectChain: (chain: ChainConfig) => void;
  onClose: () => void;
  overrideScrollAreaProps?: ComponentProps<typeof ScrollArea>;
}) => {
  return (
    <ScrollArea
      {...overrideScrollAreaProps}
      className={twMerge(
        'w-full h-full border-t border-mono-40 dark:border-mono-170 pt-4',
        overrideScrollAreaProps?.className,
      )}
    >
      <ul>
        {chains.map((chain, idx) => {
          const isConnected =
            chainType === 'source' && activeChain?.id === chain.id;

          const isDisabled = disableSelectedChain && isConnected;

          return (
            <ListItem
              key={`${chain.id}-${idx}`}
              isDisabled={isDisabled}
              className={twMerge(
                'w-full flex items-center justify-between max-w-full min-h-[60px] py-3 px-6',
                !isDisabled && 'cursor-pointer',
              )}
              onClick={() => {
                if (isDisabled || isConnected) {
                  return;
                }

                onSelectChain(chain);
                onClose?.();
              }}
            >
              <div className="flex items-center gap-4 justify-start">
                <ChainIcon
                  size="xl"
                  name={chain.displayName ?? chain.name}
                  spinnerSize="lg"
                />

                <Typography variant="h5" fw="bold" className="capitalize">
                  {chain.displayName ?? chain.name}
                </Typography>
              </div>

              {isConnected && <Chip color="green">Connected</Chip>}
            </ListItem>
          );
        })}
      </ul>
    </ScrollArea>
  );
};
