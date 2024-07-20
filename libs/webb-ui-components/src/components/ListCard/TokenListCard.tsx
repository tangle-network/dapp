'use client';

import { Search } from '@webb-tools/icons';
import { Typography } from '../../typography';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { Input } from '../Input';
import { ScrollArea } from '../ScrollArea';
import TokenSelector from '../TokenSelector';
import TokenListItem from './TokenListItem';
import { ListCardWrapper } from './ListCardWrapper';
import { AssetType, TokenListCardProps } from './types';
import { Alert } from '../Alert';
import { twMerge } from 'tailwind-merge';

export const TokenListCard = forwardRef<HTMLDivElement, TokenListCardProps>(
  (
    {
      onChange,
      onClose,
      popularTokens,
      selectTokens,
      title = 'Select a Token',
      type = 'token',
      unavailableTokens,
      value: selectedAsset,
      overrideInputProps,
      renderEmpty,
      alertTitle,
      overrideScrollAreaProps,
      ...props
    },
    ref,
  ) => {
    // Search text
    const [searchText, setSearchText] = useState('');

    const isEmpty = useMemo(
      () =>
        !popularTokens.length &&
        !selectTokens.length &&
        !unavailableTokens.length,
      [popularTokens, selectTokens, unavailableTokens],
    );

    const getFilterList = useCallback(
      (list: AssetType[]) =>
        list.filter(
          (r) =>
            r.name.toLowerCase().includes(searchText.toLowerCase()) ||
            r.symbol.toString().includes(searchText.toLowerCase()) ||
            r.assetBalanceProps?.balance
              ?.toString()
              .includes(searchText.toLowerCase()),
        ),
      [searchText],
    );

    const { filteredPopular, filteredSelect } = useMemo(
      () => ({
        filteredPopular: getFilterList(popularTokens),
        filteredSelect: getFilterList(selectTokens),
        filteredUnavailable: getFilterList(unavailableTokens),
      }),
      [getFilterList, popularTokens, selectTokens, unavailableTokens],
    );

    return (
      <ListCardWrapper {...props} title={title} onClose={onClose} ref={ref}>
        {/** The search input */}
        {!isEmpty && (
          <div className="py-4">
            <Input
              id="token"
              rightIcon={<Search />}
              placeholder="Search pool or enter token address"
              value={searchText}
              onChange={(val) => setSearchText(val.toString())}
              {...overrideInputProps}
            />
          </div>
        )}

        {/** Popular tokens */}
        {filteredPopular.length > 0 ? (
          <div className="flex flex-col p-2 space-y-2">
            <Typography variant="utility" className="uppercase mb-0.5">
              Popular {type}
            </Typography>

            <div className="flex flex-wrap gap-2">
              {filteredPopular.map((current, idx) => (
                <TokenSelector
                  key={`${current.name}-${idx}`}
                  onClick={() => onChange?.(current)}
                  isDropdown={false}
                >
                  {current.symbol}
                </TokenSelector>
              ))}
            </div>
          </div>
        ) : null}

        {/** Select tokens */}
        <div className="flex flex-col px-2 space-y-2 grow min-h-[320px]">
          {filteredSelect.length > 0 && (
            <div>
              <Typography
                variant="body4"
                className="uppercase text-mono-200 dark:text-mono-0"
                fw="bold"
              >
                Select {type}
              </Typography>

              {/** Token list */}
              <ScrollArea
                {...overrideScrollAreaProps}
                className={twMerge(
                  'h-full py-2',
                  overrideScrollAreaProps?.className,
                )}
              >
                <ul>
                  {filteredSelect.map((current, idx) => (
                    <TokenListItem
                      key={`${current.name}-${idx}`}
                      className="px-4 bg-transparent cursor-pointer dark:bg-transparent max-w-none"
                      {...current}
                      onClick={() => onChange?.(current)}
                    />
                  ))}
                </ul>
              </ScrollArea>
            </div>
          )}

          {unavailableTokens.length ? (
            <div>
              <Typography
                variant="body4"
                className="uppercase text-mono-200 dark:text-mono-0"
                fw="bold"
              >
                Unavailable {type}
              </Typography>

              {/** Token list */}
              <ScrollArea
                {...overrideScrollAreaProps}
                className={twMerge(
                  'h-full py-2',
                  overrideScrollAreaProps?.className,
                )}
              >
                <ul>
                  {unavailableTokens.map((current, idx) => (
                    <TokenListItem
                      isDisabled
                      className="px-4 bg-transparent dark:bg-transparent max-w-none"
                      key={`${current.name}-${idx}`}
                      {...current}
                    />
                  ))}
                </ul>
              </ScrollArea>
            </div>
          ) : null}

          {filteredSelect.length === 0 && (
            <div className="flex items-center justify-center h-full">
              {typeof renderEmpty === 'function' ? (
                renderEmpty()
              ) : (
                <Typography variant="h5" fw="bold" ta="center">
                  No {type} Found.
                </Typography>
              )}
            </div>
          )}
        </div>

        {/* Alert Component */}
        {alertTitle && <Alert title={alertTitle} />}
      </ListCardWrapper>
    );
  },
);
