import { Search } from '@webb-tools/icons';
import { Typography } from '../../typography';
import cx from 'classnames';
import { forwardRef, useCallback, useMemo, useState } from 'react';

import { Button } from '../Button';
import { Input } from '../Input';
import { ScrollArea } from '../ScrollArea';
import { TokenSelector } from '../TokenSelector';
import { AssetListItem } from './AssetListItem';
import { ListCardWrapper } from './ListCardWrapper';
import { AssetType, TokenListCardProps } from './types';

export const TokenListCard = forwardRef<HTMLDivElement, TokenListCardProps>(
  (
    {
      onChange,
      onClose,
      onConnect,
      popularTokens,
      selectTokens,
      title = 'Select a token from Polygon Chain',
      unavailableTokens,
      value: selectedAsset,
      ...props
    },
    ref
  ) => {
    const [, setAsset] = useState<AssetType | undefined>(() => selectedAsset);

    // Search text
    const [searchText, setSearchText] = useState('');

    const getFilterList = useCallback(
      (list: AssetType[]) =>
        list.filter(
          (r) =>
            r.name.toLowerCase().includes(searchText.toLowerCase()) ||
            r.symbol.toString().includes(searchText.toLowerCase()) ||
            r.balance?.toString().includes(searchText.toLowerCase())
        ),
      [searchText]
    );

    const onItemChange = useCallback(
      (nextItem: AssetType) => {
        // Check if the selected token is in the unavailable list
        const isInUnavailableList = unavailableTokens.find(
          (tk) => tk.name === nextItem.name && tk.symbol === nextItem.symbol
        );

        // Do not change the selected token if it is in the unavailable list
        if (isInUnavailableList) {
          return;
        }

        setAsset(nextItem);
        onChange?.(nextItem);
      },
      [onChange, setAsset]
    );

    const { filteredPopular, filteredSelect, filteredUnavailable } = useMemo(
      () => ({
        filteredPopular: getFilterList(popularTokens),
        filteredSelect: getFilterList(selectTokens),
        filteredUnavailable: getFilterList(unavailableTokens),
      }),
      [getFilterList, popularTokens, selectTokens, unavailableTokens]
    );

    return (
      <ListCardWrapper {...props} title={title} onClose={onClose} ref={ref}>
        {/** The search input */}
        <div className={cx('px-2 py-4')}>
          <Input
            id="token"
            rightIcon={<Search />}
            placeholder="Search token or enter token address"
            value={searchText}
            onChange={(val) => setSearchText(val.toString())}
          />
        </div>

        {/** Popular tokens */}
        {filteredPopular.length > 0 ? (
          <div className="flex flex-col p-2 space-y-2">
            <Typography variant="utility" className="uppercase mb-0.5">
              Popular tokens
            </Typography>

            <div className="flex flex-wrap gap-2">
              {filteredPopular.map((current, idx) => (
                <TokenSelector
                  key={`${current.name}-${idx}`}
                  onClick={() => onItemChange(current)}
                  onTokenClick={current.onTokenClick}
                >
                  {current.symbol}
                </TokenSelector>
              ))}
            </div>
          </div>
        ) : null}

        {/** Select tokens */}
        <div className="flex flex-col p-2 space-y-2">
          <Typography variant="body4" className="uppercase text-mono-200 dark:text-mono-0" fw="bold">
            Select token
          </Typography>

          {/** Token list */}
          <ScrollArea className={cx('min-w-[350px] h-[376px]')}>
            <ul>
              {filteredSelect.map((current, idx) => (
                <AssetListItem
                  key={`${current.name}-${idx}`}
                  {...current}
                  onClick={() => onItemChange(current)}
                />
              ))}
              <Typography
                variant="body4"
                fw="bold"
                className="uppercase text-mono-100 dark:text-mono-80"
              >
                Unavailable
              </Typography>
              {filteredUnavailable.map((current, idx) => (
                <AssetListItem
                  key={`${current.name}-${idx}`}
                  {...current}
                  isDisabled
                  onClick={() => onItemChange(current)}
                />
              ))}
            </ul>
          </ScrollArea>
        </div>

        <div
          className={cx(
            'flex flex-col items-center justify-center px-2 py-1 mt-9'
          )}
        >
          <Typography
            variant="utility"
            className="uppercase text-mono-100 dark:text-mono-80  max-w-[334px]"
            ta="center"
          >
            Don't see your asset?
          </Typography>

          <Button
            variant="link"
            size="sm"
            className="mt-1 text-center"
            onClick={onConnect}
          >
            Try another account or wallet
          </Button>
        </div>
      </ListCardWrapper>
    );
  }
);
