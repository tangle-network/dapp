import { useWebContext } from '@tangle-network/api-provider-environment/webb-context';
import { ChainConfig } from '@tangle-network/dapp-config';
import { ChainIcon, Search } from '@tangle-network/icons';
import {
  Chip,
  Input,
  ListItem,
  Typography,
} from '@tangle-network/ui-components';
import { ScrollArea } from '@tangle-network/ui-components/components/ScrollArea';
import { ComponentProps, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

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
}: ChainListProps) => {
  const [searchText, setSearchText] = useState('');

  const filteredChains = useMemo(() => {
    return chains.filter((chain) =>
      chain.name.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [chains, searchText]);

  const { activeChain } = useWebContext();

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

      <ScrollArea
        {...overrideScrollAreaProps}
        className={twMerge(
          'w-full h-full border-t border-mono-40 dark:border-mono-170 pt-4',
          overrideScrollAreaProps?.className,
        )}
      >
        <ul>
          {filteredChains.map((chain, idx) => {
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
                  if (isDisabled) {
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
                    {chain.name === 'Tangle Mainnet'
                      ? chain.name
                      : (chain.displayName ?? chain.name)}
                  </Typography>
                </div>

                {isConnected && <Chip color="green">Connected</Chip>}
              </ListItem>
            );
          })}
        </ul>
      </ScrollArea>
    </ListCardWrapper>
  );
};
