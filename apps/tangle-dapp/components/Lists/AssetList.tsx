import { ExternalLinkLine, Search, TokenIcon } from '@webb-tools/icons';
import {
  getRoundedAmountString,
  Input,
  ListItem,
  Typography,
} from '@webb-tools/webb-ui-components';
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea';
import Decimal from 'decimal.js';
import Link from 'next/link';
import { ComponentProps, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { ListCardWrapper } from './ListCardWrapper';

export type AssetConfig = {
  symbol: string;
  balance?: Decimal;
  explorerUrl?: string;
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
  title = 'Select Network',
  overrideScrollAreaProps,
  onSelectAsset,
}: AssetListProps) => {
  const [searchText, setSearchText] = useState('');

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) =>
      asset.symbol.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [assets, searchText]);

  return (
    <ListCardWrapper title={title} onClose={onClose}>
      <div className="px-4 md:px-9 pb-[10px] border-b border-mono-40 dark:border-mono-170">
        <Input
          id="chain"
          rightIcon={<Search />}
          placeholder="Search chains"
          value={searchText}
          onChange={(val) => setSearchText(val.toString())}
          inputClassName="placeholder:text-mono-80 dark:placeholder:text-mono-120 "
        />
      </div>

      <ScrollArea
        {...overrideScrollAreaProps}
        className={twMerge('w-full h-full', overrideScrollAreaProps?.className)}
      >
        <ul>
          {filteredAssets.map((asset, idx) => (
            <ListItem
              key={`${asset.symbol}-${idx}`}
              onClick={() => {
                onSelectAsset(asset);
                onClose?.();
              }}
              className="cursor-pointer w-full flex items-center gap-4 justify-between max-w-full min-h-[60px] py-[12px]"
            >
              <div className="flex items-center gap-2">
                <TokenIcon
                  size="lg"
                  name={asset.symbol}
                  className="mr-2 w-[38px] h-[38px]"
                />

                <div className="flex flex-col gap-1">
                  <Typography
                    variant="h5"
                    fw="bold"
                    className="block cursor-default text-mono-200 dark:text-mono-0"
                  >
                    {asset.symbol}
                  </Typography>

                  {asset.explorerUrl && (
                    <Link
                      href={asset.explorerUrl}
                      target="_blank"
                      className="flex items-center gap-1 z-20"
                    >
                      <Typography
                        variant="body1"
                        className="text-mono-120 dark:text-mono-100"
                      >
                        token address
                      </Typography>
                      <ExternalLinkLine />
                    </Link>
                  )}
                </div>
              </div>

              <Typography
                variant="h5"
                fw="bold"
                className="cursor-default text-mono-200 dark:text-mono-0"
              >
                {asset.balance
                  ? `${getRoundedAmountString(asset.balance.toNumber(), 4)} ${asset.symbol}`
                  : 'N/A'}
              </Typography>
            </ListItem>
          ))}
        </ul>
      </ScrollArea>
    </ListCardWrapper>
  );
};
