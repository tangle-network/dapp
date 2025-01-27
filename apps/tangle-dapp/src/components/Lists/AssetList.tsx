import { ArrowRightUp, Search, TokenIcon } from '@webb-tools/icons';
import {
  Input,
  ListItem,
  shortenHex,
  Typography,
} from '@webb-tools/webb-ui-components';
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea';
import { EMPTY_VALUE_PLACEHOLDER } from '@webb-tools/webb-ui-components/constants';
import { ComponentProps, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Address } from 'viem';

import { ListCardWrapper } from './ListCardWrapper';

export type AssetConfig = {
  symbol: string;
  optionalSymbol?: string;
  balance?: string;
  explorerUrl?: string;
  address?: Address;
};

type AssetListProps = {
  title?: string;
  onClose: () => void;
  assets: AssetConfig[];
  onSelectAsset: (asset: AssetConfig) => void;
  overrideScrollAreaProps?: ComponentProps<typeof ScrollArea>;
};

export const AssetList = ({
  assets,
  onClose,
  title = 'Select Asset',
  overrideScrollAreaProps,
  onSelectAsset,
}: AssetListProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) =>
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [assets, searchQuery]);

  return (
    <ListCardWrapper title={title} onClose={onClose}>
      <div className="px-4 pb-5 border-b md:px-6 border-mono-40 dark:border-mono-170">
        <Input
          id="chain"
          rightIcon={<Search />}
          placeholder="Search assets by name"
          isControlled
          value={searchQuery}
          onChange={setSearchQuery}
          inputClassName="placeholder:text-mono-80 dark:placeholder:text-mono-120 "
        />
      </div>

      <ScrollArea
        {...overrideScrollAreaProps}
        className={twMerge(
          'w-full h-[400px]',
          overrideScrollAreaProps?.className,
        )}
        style={{ position: 'relative' }}
      >
        <ul className="h-full">
          {filteredAssets.map((asset, idx) => (
            <ListItem
              key={`${asset.symbol}-${idx}`}
              onClick={() => {
                onSelectAsset(asset);
                onClose?.();
              }}
              className="cursor-pointer w-full flex items-center gap-4 justify-between max-w-full min-h-[60px] py-[12px] px-6"
            >
              <div className="flex items-center gap-2">
                {/* <TokenIcon
                  size="xl"
                  name={
                    asset.symbol === 'SolvBTC.BBN' ? 'SolvBTC' : asset.symbol
                  }
                  className="mr-2"
                  spinnerSize="lg"
                /> */}

                <div className="flex flex-col gap-1">
                  <Typography
                    variant="h5"
                    fw="bold"
                    className="cursor-default text-mono-200 dark:text-mono-0"
                  >
                    {asset.symbol}
                  </Typography>

                  {asset.explorerUrl !== undefined && (
                    <a
                      href={asset.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="z-20 flex items-center gap-1 text-mono-120 dark:text-mono-100 dark:hover:text-mono-80"
                    >
                      <Typography
                        variant="body1"
                        className="text-current dark:text-current dark:hover:text-current"
                      >
                        {asset.address !== undefined
                          ? shortenHex(asset.address)
                          : 'View Explorer'}
                      </Typography>

                      <ArrowRightUp className="fill-current dark:fill-current" />
                    </a>
                  )}
                </div>
              </div>

              <Typography
                variant="h5"
                fw="bold"
                className="cursor-default text-mono-200 dark:text-mono-0"
              >
                {asset.balance
                  ? `${asset.balance} ${asset.symbol}`
                  : EMPTY_VALUE_PLACEHOLDER}
              </Typography>
            </ListItem>
          ))}
        </ul>
      </ScrollArea>
    </ListCardWrapper>
  );
};
