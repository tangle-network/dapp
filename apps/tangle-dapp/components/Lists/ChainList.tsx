import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { ChainConfig } from '@webb-tools/dapp-config';
import { ChainIcon, Search } from '@webb-tools/icons';
import {
  Chip,
  Input,
  ListItem,
  Typography,
} from '@webb-tools/webb-ui-components';
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea';
import { ComponentProps, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { ListCardWrapper } from './ListCardWrapper';

type ChainListProps = {
  chainType: 'source' | 'destination';
  title?: string;
  onClose: () => void;
  chains: ChainConfig[];
  onSelectChain: (chain: ChainConfig) => void;
  overrideScrollAreaProps?: ComponentProps<typeof ScrollArea>;
};

export const ChainList = ({
  chains,
  onClose,
  title = 'Select Network',
  overrideScrollAreaProps,
  onSelectChain,
  chainType,
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
      <div className="px-4 md:px-9 pb-[10px] border-b border-mono-40 dark:border-mono-170">
        <Input
          id="chain"
          rightIcon={<Search />}
          placeholder="Search chains"
          value={'hello'}
          onChange={(value) => setSearchText(value)}
          inputClassName="placeholder:text-mono-80 dark:placeholder:text-mono-120"
        />
      </div>

      <ScrollArea
        {...overrideScrollAreaProps}
        className={twMerge('w-full h-full', overrideScrollAreaProps?.className)}
      >
        <ul>
          {filteredChains.map((chain, idx) => {
            const isConnected =
              chainType === 'source' && activeChain?.name === chain.name;

            return (
              <ListItem
                key={`${chain.id}-${idx}`}
                onClick={() => {
                  onSelectChain(chain);
                  onClose?.();
                }}
                className="cursor-pointer w-full flex items-center justify-between max-w-full min-h-[60px] py-[12px]"
              >
                <div className="flex items-center gap-4 justify-start">
                  <ChainIcon
                    size="lg"
                    name={chain.name}
                    className="cursor-pointer"
                  />

                  <Typography
                    variant="h5"
                    fw="bold"
                    className="capitalize cursor-pointer"
                  >
                    {chain.name}
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
